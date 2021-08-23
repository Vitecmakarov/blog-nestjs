import { classToPlain } from 'class-transformer';

import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../../src/category/categories.module';
import { PostsModule } from '../../src/post/posts.module';
import { UsersModule } from '../../src/user/users.module';

import { CategoriesEntity } from '../../src/category/categories.entity';
import { PostsEntity } from '../../src/post/posts.entity';
import { UsersEntity } from '../../src/user/users.entity';

import { CategoriesService } from '../../src/category/categories.service';
import { PostsService } from '../../src/post/posts.service';
import { UsersService } from '../../src/user/users.service';

import { TestEntities } from './test_entities/test.entites';

describe('Posts module', () => {
  let app: INestApplication;

  let usersService: UsersService;
  let postsService: PostsService;
  let categoriesService: CategoriesService;

  let usersEntityRepository: Repository<UsersEntity>;
  let postsEntityRepository: Repository<PostsEntity>;
  let categoriesEntityRepository: Repository<CategoriesEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        PostsModule,
        CategoriesModule,
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
    postsService = module.get(PostsService);
    categoriesService = module.get(CategoriesService);

    usersEntityRepository = module.get(getRepositoryToken(UsersEntity));
    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    categoriesEntityRepository = module.get(
      getRepositoryToken(CategoriesEntity),
    );
    await app.init();
  }, 15000);

  afterEach(async () => {
    await postsEntityRepository.query(`DELETE FROM posts_categories;`);
    await postsEntityRepository.query(`DELETE FROM posts;`);
    await categoriesEntityRepository.query(`DELETE FROM categories;`);
    await usersEntityRepository.query(`DELETE FROM users;`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /categories/create', async () => {
    const dataBeforeInsert = classToPlain(categoriesService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
    );

    const user = await testEntities.createTestUser();

    await request
      .agent(app.getHttpServer())
      .post('/categories/create')
      .set('Accept', 'application/json')
      .send({
        user_id: user.id,
        title: 'title_test',
      })
      .expect(201);

    const dataAfterInsert = classToPlain(categoriesService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([
      {
        id: expect.any(String),
        title: 'title_test',
        user: {
          id: user.id,
          first_name: 'first_name_test',
          last_name: 'last_name_test',
          mobile: 'mobile_test',
          email: 'email_test',
          register_at: expect.any(Date),
          last_login: null,
          profile_desc: null,
          is_banned: false,
        },
        posts: [],
      },
    ]);
  });

  it('GET /categories/category/:id', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
    );
    const user = await testEntities.createTestUser();
    const category = await testEntities.createTestCategory(user.id);
    const post = await testEntities.createTestPost(user.id, [category.id]);

    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/categories/category/${category.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual({
      id: category.id,
      title: 'title_test',
      posts: [
        {
          id: post.id,
          title: 'title_test',
          content: 'content_test',
          created_at: expect.any(String),
          updated_at: null,
        },
      ],
      user: {
        id: user.id,
        first_name: 'first_name_test',
        last_name: 'last_name_test',
        mobile: 'mobile_test',
        email: 'email_test',
        password: expect.any(String),
        register_at: expect.any(String),
        last_login: null,
        profile_desc: null,
        is_banned: false,
      },
    });
  });

  it('GET /categories/user/:id', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
    );
    const user = await testEntities.createTestUser();
    const category = await testEntities.createTestCategory(user.id);
    const post = await testEntities.createTestPost(user.id, [category.id]);

    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/categories/user/${user.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual([
      {
        id: category.id,
        title: 'title_test',
        posts: [
          {
            id: post.id,
            title: 'title_test',
            content: 'content_test',
            created_at: expect.any(String),
            updated_at: null,
          },
        ],
        user: {
          id: user.id,
          first_name: 'first_name_test',
          last_name: 'last_name_test',
          mobile: 'mobile_test',
          email: 'email_test',
          password: expect.any(String),
          register_at: expect.any(String),
          last_login: null,
          profile_desc: null,
          is_banned: false,
        },
      },
    ]);
  });

  it('GET /title/:user&:title', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
    );
    const user = await testEntities.createTestUser();
    const category = await testEntities.createTestCategory(user.id);
    const post = await testEntities.createTestPost(user.id, [category.id]);

    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/categories/title/${user.id}&title_test`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual([
      {
        id: category.id,
        title: 'title_test',
        posts: [
          {
            id: post.id,
            title: 'title_test',
            content: 'content_test',
            created_at: expect.any(String),
            updated_at: null,
          },
        ],
        user: {
          id: user.id,
          first_name: 'first_name_test',
          last_name: 'last_name_test',
          mobile: 'mobile_test',
          email: 'email_test',
          password: expect.any(String),
          register_at: expect.any(String),
          last_login: null,
          profile_desc: null,
          is_banned: false,
        },
      },
    ]);
  });

  it('PATCH /categories/category/:id', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
    );
    const user = await testEntities.createTestUser();
    const category = await testEntities.createTestCategory(user.id);
    const post = await testEntities.createTestPost(user.id, [category.id]);

    await request
      .agent(app.getHttpServer())
      .patch(`/categories/category/${category.id}`)
      .set('Accept', 'application/json')
      .send({
        title: 'title_changed',
      })
      .expect(200);

    const dataAfterUpdate = classToPlain(categoriesService.getAll());

    await expect(dataAfterUpdate).resolves.toEqual([
      {
        id: category.id,
        title: 'title_changed',
        posts: [
          {
            id: post.id,
            title: 'title_test',
            content: 'content_test',
            created_at: expect.any(Date),
            updated_at: null,
          },
        ],
        user: {
          id: user.id,
          first_name: 'first_name_test',
          last_name: 'last_name_test',
          mobile: 'mobile_test',
          email: 'email_test',
          register_at: expect.any(Date),
          last_login: null,
          profile_desc: null,
          is_banned: false,
        },
      },
    ]);
  });

  it('DELETE /categories/category/:id', async () => {
    const testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
    );
    const user = await testEntities.createTestUser();
    const category = await testEntities.createTestCategory(user.id);
    await testEntities.createTestPost(user.id, [category.id]);

    await request
      .agent(app.getHttpServer())
      .delete(`/categories/category/${category.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterUpdate = classToPlain(categoriesService.getAll());

    await expect(dataAfterUpdate).resolves.toEqual([]);
  });
});
