import { classToPlain } from 'class-transformer';

import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../src/user/users.module';
import { CategoriesModule } from '../../src/category/categories.module';
import { PostsModule } from '../../src/post/posts.module';
import { CommentsModule } from '../../src/comment/comments.module';

import { Repository } from 'typeorm';

import {
  CreatePostCommentDto,
  UpdatePostCommentDto,
} from '../../src/comment/dto/comments.dto';

import { UsersEntity } from '../../src/user/users.entity';
import { CategoriesEntity } from '../../src/category/categories.entity';
import { PostsEntity } from '../../src/post/posts.entity';
import { CommentsEntity } from '../../src/comment/comments.entity';

import { UsersService } from '../../src/user/users.service';
import { CategoriesService } from '../../src/category/categories.service';
import { PostsService } from '../../src/post/posts.service';
import { CommentsService } from '../../src/comment/comments.service';

import { TestEntities } from './test_entities/test.entites';

describe('Posts module', () => {
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
    categoriesEntityRepository = module.get(
      getRepositoryToken(CategoriesEntity),
    );
    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    commentsEntityRepository = module.get(getRepositoryToken(CommentsEntity));

    testEntities = new TestEntities(
      usersService,
      categoriesService,
      postsService,
      commentsService,
    );

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
  });

  it('POST /comments/create', async () => {
    const dataBeforeInsert = classToPlain(commentsService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
      categoryEntity.id,
    ]);

    const commentDto = new CreatePostCommentDto(
      userEntity.id,
      postEntity.id,
      'content_test',
    );

    await request
      .agent(app.getHttpServer())
      .post('/comments/create')
      .set('Accept', 'application/json')
      .send(commentDto)
      .expect(201);

    const dataAfterInsert = classToPlain(commentsService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([
      {
        id: expect.any(String),
        content: commentDto.content,
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
        post: {
          id: postEntity.id,
          title: postEntity.title,
          content: postEntity.content,
          created_at: expect.any(Date),
          updated_at: postEntity.updated_at,
        },
        created_at: expect.any(Date),
        updated_at: null,
      },
    ]);
  });

  it('GET /comments/comment/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
      categoryEntity.id,
    ]);

    const commentEntity = await testEntities.createTestCommentEntity(
      userEntity.id,
      postEntity.id,
    );
    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/comments/comment/${commentEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual({
      id: commentEntity.id,
      content: commentEntity.content,
      user: {
        id: userEntity.id,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        mobile: userEntity.mobile,
        email: userEntity.email,
        password: expect.any(String),
        register_at: expect.any(String),
        last_login: userEntity.last_login,
        profile_desc: userEntity.profile_desc,
        is_banned: userEntity.is_banned,
      },
      post: {
        id: postEntity.id,
        title: postEntity.title,
        content: postEntity.content,
        created_at: expect.any(String),
        updated_at: postEntity.updated_at,
      },
      created_at: expect.any(String),
      updated_at: null,
    });
  });

  it('GET /comments/user/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
      categoryEntity.id,
    ]);

    const commentEntity = await testEntities.createTestCommentEntity(
      userEntity.id,
      postEntity.id,
    );
    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/comments/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual([
      {
        id: expect.any(String),
        content: commentEntity.content,
        user: {
          id: userEntity.id,
          first_name: userEntity.first_name,
          last_name: userEntity.last_name,
          mobile: userEntity.mobile,
          email: userEntity.email,
          password: expect.any(String),
          register_at: expect.any(String),
          last_login: userEntity.last_login,
          profile_desc: userEntity.profile_desc,
          is_banned: userEntity.is_banned,
        },
        post: {
          id: postEntity.id,
          title: postEntity.title,
          content: postEntity.content,
          created_at: expect.any(String),
          updated_at: postEntity.updated_at,
        },
        created_at: expect.any(String),
        updated_at: null,
      },
    ]);
  });

  it('GET /comments/post/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
      categoryEntity.id,
    ]);

    const commentEntity = await testEntities.createTestCommentEntity(
      userEntity.id,
      postEntity.id,
    );
    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/comments/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual([
      {
        id: expect.any(String),
        content: commentEntity.content,
        user: {
          id: userEntity.id,
          first_name: userEntity.first_name,
          last_name: userEntity.last_name,
          mobile: userEntity.mobile,
          email: userEntity.email,
          password: expect.any(String),
          register_at: expect.any(String),
          last_login: userEntity.last_login,
          profile_desc: userEntity.profile_desc,
          is_banned: userEntity.is_banned,
        },
        post: {
          id: postEntity.id,
          title: postEntity.title,
          content: postEntity.content,
          created_at: expect.any(String),
          updated_at: postEntity.updated_at,
        },
        created_at: expect.any(String),
        updated_at: null,
      },
    ]);
  });

  it('PATCH /comments/comment/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
      categoryEntity.id,
    ]);

    const commentEntity = await testEntities.createTestCommentEntity(
      userEntity.id,
      postEntity.id,
    );

    const commentDto = new UpdatePostCommentDto('content_test');

    await request
      .agent(app.getHttpServer())
      .patch(`/comments/comment/${commentEntity.id}`)
      .set('Accept', 'application/json')
      .send(commentDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(commentsService.getAll());
    expect(dataAfterUpdate).resolves.toEqual([
      {
        id: expect.any(String),
        content: commentDto.content,
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
        post: {
          id: postEntity.id,
          title: postEntity.title,
          content: postEntity.content,
          created_at: expect.any(Date),
          updated_at: postEntity.updated_at,
        },
        created_at: expect.any(Date),
        updated_at: null,
      },
    ]);
  });

  it('DELETE /comments/comment/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
      categoryEntity.id,
    ]);

    const commentEntity = await testEntities.createTestCommentEntity(
      userEntity.id,
      postEntity.id,
    );

    await request
      .agent(app.getHttpServer())
      .delete(`/comments/comment/${commentEntity.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterUpdate = classToPlain(commentsService.getAll());

    await expect(dataAfterUpdate).resolves.toEqual([]);
  });
});
