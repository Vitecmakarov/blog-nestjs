import { promisify } from 'util';
import { classToPlain } from 'class-transformer';
import { config } from 'dotenv';

import * as rimraf from 'rimraf';
import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../src/user/users.module';
import { CategoriesModule } from '../../src/category/categories.module';
import { PostsModule } from '../../src/post/posts.module';
import { CommentsModule } from '../../src/comment/comments.module';

import { Repository } from 'typeorm';

import { CreatePostDto, UpdatePostDto } from '../../src/post/dto/posts.dto';
import {
  CategoryAction,
  UpdateCategoryAction,
} from '../../src/category/dto/categories.dto';

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
    const deleteTestImagesDir = promisify(rimraf);
    await deleteTestImagesDir(process.env.PWD + process.env.IMAGES_DIR);
  });

  it('POST /posts/create', async () => {
    const dataBeforeInsert = classToPlain(postsService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );

    const imageDto = await testEntities.createTestImageDto();

    const postDto = new CreatePostDto(
      userEntity.id,
      [categoryEntity.id],
      'title_test',
      'content_test',
      imageDto,
    );

    await request
      .agent(app.getHttpServer())
      .post('/posts/create')
      .set('Accept', 'application/json')
      .send(postDto)
      .expect(201);

    const dataAfterInsert = classToPlain(postsService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([
      {
        id: expect.any(String),
        title: postDto.title,
        content: postDto.content,
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
        categories: [
          {
            id: categoryEntity.id,
            title: categoryEntity.title,
          },
        ],
        image: {
          id: expect.any(String),
          path: expect.any(String),
          size: expect.any(Number),
          extension: expect.any(String),
          upload_timestamp: expect.any(Date),
        },
        comments: [],
        created_at: expect.any(Date),
        updated_at: null,
      },
    ]);
  });

  it('GET /posts/all', async () => {
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
      .get('/posts/all')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual([
      {
        id: postEntity.id,
        title: postEntity.title,
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
        categories: [
          {
            id: categoryEntity.id,
            title: categoryEntity.title,
          },
        ],
        image: null,
        comments: [
          {
            id: commentEntity.id,
            content: commentEntity.content,
            created_at: expect.any(String),
            updated_at: commentEntity.updated_at,
          },
        ],
        content: postEntity.content,
        created_at: expect.any(String),
        updated_at: postEntity.updated_at,
      },
    ]);
  });

  it('GET /posts/post/:id', async () => {
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
      .get(`/posts/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual({
      id: postEntity.id,
      title: postEntity.title,
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
      categories: [
        {
          id: categoryEntity.id,
          title: categoryEntity.title,
        },
      ],
      image: null,
      comments: [
        {
          id: commentEntity.id,
          content: commentEntity.content,
          created_at: expect.any(String),
          updated_at: commentEntity.updated_at,
        },
      ],
      content: postEntity.content,
      created_at: expect.any(String),
      updated_at: postEntity.updated_at,
    });
  });

  // it('GET /posts/category/:id', async () => {
  //   const userEntity = await testEntities.createTestUserEntity();
  //   const categoryEntity = await testEntities.createTestCategoryEntity(
  //     userEntity.id,
  //   );
  //   const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
  //     categoryEntity.id,
  //   ]);
  //
  //   const commentEntity = await testEntities.createTestCommentEntity(
  //     userEntity.id,
  //     postEntity.id,
  //   );
  //   const { body } = await request
  //     .agent(app.getHttpServer())
  //     .get(`/posts/category/${categoryEntity.id}`)
  //     .set('Accept', 'application/json')
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //
  //   expect(body).toEqual([
  //     {
  //       id: postEntity.id,
  //       title: postEntity.title,
  //       user: {
  //         id: userEntity.id,
  //         first_name: userEntity.first_name,
  //         last_name: userEntity.last_name,
  //         mobile: userEntity.mobile,
  //         email: userEntity.email,
  //         password: userEntity.password,
  //         register_at: expect.any(String),
  //         last_login: userEntity.last_login,
  //         profile_desc: userEntity.profile_desc,
  //         is_banned: userEntity.is_banned,
  //       },
  //       categories: [
  //         {
  //           id: categoryEntity.id,
  //           title: categoryEntity.title,
  //         },
  //       ],
  //       image: postEntity.image,
  //       comments: [
  //         {
  //           id: commentEntity.id,
  //           content: commentEntity.content,
  //           created_at: expect.any(String),
  //           updated_at: commentEntity.updated_at,
  //         },
  //       ],
  //       content: postEntity.content,
  //       created_at: expect.any(String),
  //       updated_at: postEntity.updated_at,
  //     },
  //   ]);
  // });

  it('GET /posts/user/:id', async () => {
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
      .get(`/posts/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual([
      {
        id: postEntity.id,
        title: postEntity.title,
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
        categories: [
          {
            id: categoryEntity.id,
            title: categoryEntity.title,
          },
        ],
        image: null,
        comments: [
          {
            id: commentEntity.id,
            content: commentEntity.content,
            created_at: expect.any(String),
            updated_at: commentEntity.updated_at,
          },
        ],
        content: postEntity.content,
        created_at: expect.any(String),
        updated_at: postEntity.updated_at,
      },
    ]);
  });

  it('PATCH /posts/post/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const firstCategoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );

    const secondCategoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );

    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
      firstCategoryEntity.id,
    ]);

    const categoryAction = new UpdateCategoryAction(
      CategoryAction.ADD,
      secondCategoryEntity.id,
    );

    const imageDto = await testEntities.createTestImageDto();

    const postDto = new UpdatePostDto(
      [categoryAction],
      'title_test',
      'content_test',
      imageDto,
    );

    await request
      .agent(app.getHttpServer())
      .patch(`/posts/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .send(postDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(postsService.getAll());
    expect(dataAfterUpdate).resolves.toEqual([
      {
        id: postEntity.id,
        title: postDto.title,
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
        categories: expect.any(Array), // TODO
        image: {
          id: expect.any(String),
          path: expect.any(String),
          extension: expect.any(String),
          size: expect.any(Number),
          upload_timestamp: expect.any(Date),
        },
        comments: [],
        content: postDto.content,
        created_at: expect.any(Date),
        updated_at: postEntity.updated_at,
      },
    ]);
  });

  it('DELETE /posts/post/:id', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(
      userEntity.id,
    );
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [
      categoryEntity.id,
    ]);

    await request
      .agent(app.getHttpServer())
      .delete(`/posts/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterUpdate = classToPlain(postsService.getAll());

    await expect(dataAfterUpdate).resolves.toEqual([]);
  });
});
