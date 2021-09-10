import { classToPlain } from 'class-transformer';

import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CategoriesModule } from '../../src/category/categories.module';
import { PostsModule } from '../../src/post/posts.module';
import { UsersModule } from '../../src/user/users.module';

import { CreateCategoryDto } from '../../src/category/dto/create.category.dto';
import { UpdateCategoryDto } from '../../src/category/dto/update.category.dto';

import { CategoriesEntity } from '../../src/category/entity/categories.entity';
import { PostsEntity } from '../../src/post/entity/posts.entity';
import { UsersEntity } from '../../src/user/entity/users.entity';

import { CategoriesService } from '../../src/category/service/categories.service';
import { PostsService } from '../../src/post/service/posts.service';
import { UsersService } from '../../src/user/service/users.service';

import { UserTestEntity } from './test_entities/user.test.entity';
import { CategoryTestEntity } from './test_entities/category.test.entity';
import { PostTestEntity } from './test_entities/post.test.entity';

describe('Categories module', () => {
  let app: INestApplication;

  let usersEntityRepository: Repository<UsersEntity>;
  let postsEntityRepository: Repository<PostsEntity>;
  let categoriesEntityRepository: Repository<CategoriesEntity>;

  let usersService: UsersService;
  let postsService: PostsService;
  let categoriesService: CategoriesService;

  let userTestEntity: UserTestEntity;
  let categoryTestEntity: CategoryTestEntity;
  let postTestEntity: PostTestEntity;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        PostsModule,
        CategoriesModule,
        ThrottlerModule.forRoot({
          ttl: 60,
          limit: 10,
        }),
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

    usersEntityRepository = module.get(getRepositoryToken(UsersEntity));
    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    categoriesEntityRepository = module.get(getRepositoryToken(CategoriesEntity));

    usersService = module.get(UsersService);
    postsService = module.get(PostsService);
    categoriesService = module.get(CategoriesService);

    userTestEntity = new UserTestEntity(usersService);
    categoryTestEntity = new CategoryTestEntity(categoriesService);
    postTestEntity = new PostTestEntity(postsService);

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

    const userEntity = await userTestEntity.create();

    const categoryDto = new CreateCategoryDto(userEntity.id, 'title_test');

    const expectedObj = {
      id: expect.any(String),
      title: categoryDto.title,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: userEntity.register_at,
        last_login: userEntity.last_login,
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
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);

    const expectedResponseObj = {
      id: categoryEntity.id,
      title: categoryEntity.title,
      posts: [
        {
          id: postEntity.id,
          title: postEntity.title,
          content: postEntity.content,
          rating: 0,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ],
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(String),
        last_login: userEntity.last_login,
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
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);

    const categoryDto = new UpdateCategoryDto('title_changed');

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
        profile_desc: userEntity.profile_desc,
        rating: userEntity.rating,
        register_at: expect.any(Date),
        last_login: userEntity.last_login,
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
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    await postTestEntity.create(userEntity.id, [categoryEntity.id]);

    await request
      .agent(app.getHttpServer())
      .delete(`/categories/category/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterUpdate = classToPlain(categoriesService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([]);
  });
});
