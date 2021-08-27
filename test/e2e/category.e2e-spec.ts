import { classToPlain } from 'class-transformer';

import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../../src/category/categories.module';
import { PostsModule } from '../../src/post/posts.module';
import { UsersModule } from '../../src/user/users.module';

import { CreateCategoriesDto, UpdateCategoriesDto} from '../../src/category/dto/categories.dto';

import { CategoriesEntity } from '../../src/category/categories.entity';
import { PostsEntity } from '../../src/post/posts.entity';
import { UsersEntity } from '../../src/user/users.entity';

import { CategoriesService } from '../../src/category/categories.service';
import { PostsService } from '../../src/post/posts.service';
import { UsersService } from '../../src/user/users.service';

import { TestEntities } from './test_entities/test.entites';

describe('Categories module', () => {
  let app: INestApplication;

  let testEntities: TestEntities;

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
    categoriesEntityRepository = module.get(getRepositoryToken(CategoriesEntity));

    testEntities = new TestEntities(usersService, categoriesService, postsService);

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

    const userEntity = await testEntities.createTestUserEntity();

    const categoryDto = new CreateCategoriesDto(userEntity.id, 'title_test');

    const expectedObj = {
      id: expect.any(String),
      title: categoryDto.title,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        register_at: userEntity.register_at,
        last_login: userEntity.last_login,
        profile_desc: userEntity.profile_desc,
        is_banned: userEntity.is_banned,
      },
      posts: [],
    };

    await request
      .agent(app.getHttpServer())
      .post('/categories/create')
      .set('Accept', 'application/json')
      .send(categoryDto)
      .expect(201);

    const dataAfterInsert = classToPlain(categoriesService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);
  });

  it('GET (/categories/category/:id, /categories/user/:id, /categories/title/:title)', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(userEntity.id);
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [categoryEntity.id]);

    const expectedResponseObj = {
      id: categoryEntity.id,
      title: categoryEntity.title,
      posts: [
        {
          id: postEntity.id,
          title: postEntity.title,
          content: postEntity.content,
          created_at: expect.any(String),
          updated_at: postEntity.updated_at,
        },
      ],
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        password: userEntity.password,
        register_at: expect.any(String),
        last_login: userEntity.last_login,
        profile_desc: userEntity.profile_desc,
        is_banned: userEntity.is_banned,
      },
    };

    let response = await request
      .agent(app.getHttpServer())
      .get(`/categories/category/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual(expectedResponseObj);

    response = await request
      .agent(app.getHttpServer())
      .get(`/categories/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);

    response = await request
      .agent(app.getHttpServer())
      .get(`/categories/title/${categoryEntity.title}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);
  });

  it('PATCH /categories/category/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(userEntity.id);

    const categoryDto = new UpdateCategoriesDto('title_changed');

    const expectedObj = {
      id: categoryEntity.id,
      title: categoryDto.title,
      posts: [],
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        register_at: expect.any(Date),
        last_login: userEntity.last_login,
        profile_desc: userEntity.profile_desc,
        is_banned: userEntity.is_banned,
      },
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/categories/category/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .send(categoryDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(categoriesService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([expectedObj]);
  });

  it('DELETE /categories/category/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(userEntity.id);
    await testEntities.createTestPostEntity(userEntity.id, [categoryEntity.id]);

    await request
      .agent(app.getHttpServer())
      .delete(`/categories/category/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterUpdate = classToPlain(categoriesService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([]);
  });
});
