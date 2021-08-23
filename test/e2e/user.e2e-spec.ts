import { lookup } from 'mime-types';
import { basename } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { classToPlain } from 'class-transformer';
import { config } from 'dotenv';

import * as rimraf from 'rimraf';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../src/user/users.module';
import { CategoriesModule } from '../../src/category/categories.module';
import { PostsModule } from '../../src/post/posts.module';
import { CommentsModule } from '../../src/comment/comments.module';

import { Repository } from 'typeorm';

import { UsersEntity } from '../../src/user/users.entity';
import { CategoriesEntity } from '../../src/category/categories.entity';
import { PostsEntity } from '../../src/post/posts.entity';
import { CommentsEntity } from '../../src/comment/comments.entity';

import { UsersService } from '../../src/user/users.service';
import { CategoriesService } from '../../src/category/categories.service';
import { PostsService } from '../../src/post/posts.service';
import { CommentsService } from '../../src/comment/comments.service';

import { TestEntities } from './test_entities/test.entites';

config({ path: `./env/.env.${process.env.NODE_ENV}` });

describe('Users module', () => {
  let app: INestApplication;

  let usersService: UsersService;
  let categoriesService: CategoriesService;
  let postsService: PostsService;
  let commentsService: CommentsService;

  let usersEntityRepository: Repository<UsersEntity>;
  let categoriesEntityRepository: Repository<CategoriesEntity>;
  let postsEntityRepository: Repository<PostsEntity>;
  let commentsEntityRepository: Repository<CommentsEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        CategoriesModule,
        PostsModule,
        CommentsModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3308,
          username: 'user',
          password: 'us777199',
          database: 'nestjs_blog_test',
          entities: ['./**/*.entity.ts'],
          synchronize: true,
        }),
      ],
    }).compile();

    app = module.createNestApplication();

    usersService = module.get(UsersService);
    categoriesService = module.get(CategoriesService);
    postsService = module.get(PostsService);
    commentsService = module.get(CommentsService);

    usersEntityRepository = module.get(getRepositoryToken(UsersEntity));
    categoriesEntityRepository = module.get(
      getRepositoryToken(CategoriesEntity),
    );
    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    commentsEntityRepository = module.get(getRepositoryToken(CommentsEntity));

    await app.init();
  }, 15000);

  afterEach(async () => {
    await postsEntityRepository.query(`DELETE FROM posts_categories;`);
    await postsEntityRepository.query(`DELETE FROM posts;`);
    await categoriesEntityRepository.query(`DELETE FROM categories;`);
    await commentsEntityRepository.query(`DELETE FROM comments;`);
    await usersEntityRepository.query(`DELETE FROM users;`);
  });

  afterAll(async () => {
    await app.close();
    const deleteTestImagesDir = promisify(rimraf);
    await deleteTestImagesDir(process.env.PWD + process.env.IMAGES_DIR);
  });

  it('POST /users/register', async () => {
    const dataBeforeInsert = classToPlain(usersService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    await request
      .agent(app.getHttpServer())
      .post('/users/register')
      .set('Accept', 'application/json')
      .send({
        first_name: 'first_name_test',
        last_name: 'last_name_test',
        mobile: 'mobile_test',
        email: 'email_test',
        password: 'password_test',
      })
      .expect(201);

    const promiseUser = usersService.getAll();

    const dataAfterInsert = classToPlain(promiseUser);
    await expect(dataAfterInsert).resolves.toEqual([
      {
        id: expect.any(String),
        first_name: 'first_name_test',
        last_name: 'last_name_test',
        mobile: 'mobile_test',
        email: 'email_test',
        created_posts: [],
        created_categories: [],
        created_comments: [],
        avatar: null,
        register_at: expect.any(Date),
        last_login: null,
        profile_desc: null,
        is_banned: false,
      },
    ]);

    const [user] = await promiseUser;

    const isPasswordSavedCorrectly = await bcrypt.compare(
      'password_test',
      user.password,
    );
    if (!isPasswordSavedCorrectly) {
      throw new Error('Password is not saved correctly');
    }
  });

  it('GET /users/user/:id', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
      commentsService,
    );

    const user = await testEntities.createTestUser();
    const category = await testEntities.createTestCategory(user.id);
    const post = await testEntities.createTestPost(user.id, [category.id]);
    const comment = await testEntities.createTestComment(user.id, post.id);

    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/users/user/${user.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual({
      id: user.id,
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      created_posts: [
        {
          id: post.id,
          title: 'title_test',
          content: 'content_test',
          created_at: expect.any(String),
          updated_at: null,
        },
      ],
      created_categories: [
        {
          id: category.id,
          title: 'title_test',
        },
      ],
      created_comments: [
        {
          id: comment.id,
          content: 'content_test',
          created_at: expect.any(String),
          updated_at: null,
        },
      ],
      avatar: null,
      register_at: expect.any(String),
      last_login: null,
      profile_desc: null,
      is_banned: false,
    });
  });

  it('PATCH /users/user/:id', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
      commentsService,
    );

    const user = await testEntities.createTestUser();

    const read = promisify(readFile);
    const pathToTestFile = `${__dirname}/test_image.png`;

    const image_data = await read(pathToTestFile, { encoding: 'base64' });
    const test_image = {
      filename: basename(pathToTestFile),
      type: lookup(pathToTestFile),
      data: image_data,
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/users/user/${user.id}`)
      .set('Accept', 'application/json')
      .send({
        first_name: 'first_name_test_changed',
        last_name: 'last_name_test_changed',
        profile_desc: 'this is test description',
        avatar: test_image,
      })
      .expect(200);

    const dataAfterUpdate = classToPlain(usersService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([
      {
        id: user.id,
        first_name: 'first_name_test_changed',
        last_name: 'last_name_test_changed',
        mobile: 'mobile_test',
        email: 'email_test',
        created_posts: [],
        created_categories: [],
        created_comments: [],
        avatar: {
          id: expect.any(String),
          path: expect.any(String),
          size: expect.any(Number),
          extension: expect.any(String),
          upload_timestamp: expect.any(Date),
        },
        register_at: expect.any(Date),
        last_login: null,
        profile_desc: 'this is test description',
        is_banned: expect.any(Boolean),
      },
    ]);
  });

  it('PATCH /users/pass/user/:id', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
      commentsService,
    );

    let user = await testEntities.createTestUser();

    await request
      .agent(app.getHttpServer())
      .patch(`/users/pass/user/${user.id}`)
      .set('Accept', 'application/json')
      .send({ password: 'new_password' })
      .expect(200);

    [user] = await usersService.getAll();

    const isPasswordChanged = await bcrypt.compare(
      'new_password',
      user.password,
    );
    if (!isPasswordChanged) {
      throw new Error('Password is not changed');
    }
  });

  it('DELETE /users/user/:id', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
      commentsService,
    );

    const user = await testEntities.createTestUser();
    const category = await testEntities.createTestCategory(user.id);
    const post = await testEntities.createTestPost(user.id, [category.id]);
    await testEntities.createTestComment(user.id, post.id);

    await request
      .agent(app.getHttpServer())
      .delete(`/users/user/${user.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterDelete = usersService.getAll();
    await expect(dataAfterDelete).resolves.toEqual([]);
  });
});
