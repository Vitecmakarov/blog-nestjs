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

import { CreateUserDto, UpdateUserDto, UpdateUserPasswordDto } from '../../src/user/dto/users.dto';

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

  let testEntities: TestEntities;

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
    categoriesEntityRepository = module.get(getRepositoryToken(CategoriesEntity));
    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    commentsEntityRepository = module.get(getRepositoryToken(CommentsEntity));

    testEntities = new TestEntities(usersService, categoriesService, postsService, commentsService);

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

    const userDto = new CreateUserDto(
      'first_name_test',
      'last_name_test',
      'mobile_test',
      'email_test',
      'password_test',
    );

    const expectedObj = {
      id: expect.any(String),
      first_name: userDto.first_name,
      last_name: userDto.last_name,
      mobile: userDto.mobile,
      email: userDto.email,
      created_posts: [],
      created_categories: [],
      created_comments: [],
      avatar: null,
      register_at: expect.any(Date),
      last_login: null,
      profile_desc: null,
      is_banned: false,
    };

    await request
      .agent(app.getHttpServer())
      .post('/users/register')
      .set('Accept', 'application/json')
      .send(userDto)
      .expect(201);

    const promiseUser = usersService.getAll();

    const dataAfterInsert = classToPlain(promiseUser);
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);

    const [user] = await promiseUser;

    const isPasswordSavedCorrectly = await bcrypt.compare(userDto.password, user.password);
    if (!isPasswordSavedCorrectly) {
      throw new Error('Password is not saved correctly');
    }
  });

  it('GET /users/user/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(userEntity.id);
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [categoryEntity.id]);
    const commentEntity = await testEntities.createTestCommentEntity(userEntity.id, postEntity.id);

    const expectedResponseObj = {
      id: userEntity.id,
      first_name: userEntity.first_name,
      last_name: userEntity.last_name,
      mobile: userEntity.mobile,
      email: userEntity.email,
      created_posts: [
        {
          id: postEntity.id,
          title: postEntity.title,
          content: postEntity.content,
          created_at: expect.any(String),
          updated_at: postEntity.updated_at,
        },
      ],
      created_categories: [
        {
          id: categoryEntity.id,
          title: categoryEntity.title,
        },
      ],
      created_comments: [
        {
          id: commentEntity.id,
          content: commentEntity.content,
          created_at: expect.any(String),
          updated_at: commentEntity.updated_at,
        },
      ],
      avatar: null,
      register_at: expect.any(String),
      last_login: userEntity.last_login,
      profile_desc: userEntity.profile_desc,
      is_banned: userEntity.is_banned,
    };

    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/users/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual(expectedResponseObj);
  });

  it('PATCH /users/user/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const imageDto = await testEntities.createTestImageDto();

    const userDto = new UpdateUserDto(
      'first_name_test_changed',
      'last_name_test_changed',
      'this is test description',
      imageDto,
    );

    const expectedObj = {
      id: userEntity.id,
      first_name: userDto.first_name,
      last_name: userDto.last_name,
      mobile: userEntity.mobile,
      email: userEntity.email,
      created_posts: [],
      created_categories: [],
      created_comments: [],
      avatar: {
        id: expect.any(String),
        path: expect.any(String),
        extension: expect.any(String),
        size: expect.any(Number),
        upload_timestamp: expect.any(Date),
      },
      register_at: expect.any(Date),
      last_login: userEntity.last_login,
      profile_desc: userDto.profile_desc,
      is_banned: userEntity.is_banned,
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/users/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .send(userDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(usersService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([expectedObj]);
  });

  it('PATCH /users/pass/user/:id', async () => {
    let user = await testEntities.createTestUserEntity();
    const userDto = new UpdateUserPasswordDto('new_password');

    await request
      .agent(app.getHttpServer())
      .patch(`/users/pass/user/${user.id}`)
      .set('Accept', 'application/json')
      .send(userDto)
      .expect(200);

    [user] = await usersService.getAll();

    const isPasswordChanged = await bcrypt.compare(userDto.password, user.password);
    if (!isPasswordChanged) {
      throw new Error('Password is not changed');
    }
  });

  it('DELETE /users/user/:id', async () => {
    const user = await testEntities.createTestUserEntity();
    const category = await testEntities.createTestCategoryEntity(user.id);
    const post = await testEntities.createTestPostEntity(user.id, [category.id]);
    await testEntities.createTestCommentEntity(user.id, post.id);

    await request
      .agent(app.getHttpServer())
      .delete(`/users/user/${user.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterDelete = usersService.getAll();
    await expect(dataAfterDelete).resolves.toEqual([]);
  });
});
