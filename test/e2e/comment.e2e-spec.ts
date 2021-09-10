import { classToPlain } from 'class-transformer';

import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '../../src/user/users.module';
import { CategoriesModule } from '../../src/category/categories.module';
import { PostsModule } from '../../src/post/posts.module';
import { CommentsModule } from '../../src/comment/comments.module';

import { Repository } from 'typeorm';

import { CreatePostCommentDto } from '../../src/comment/dto/create.post-coment.dto';
import { UpdatePostCommentDto } from '../../src/comment/dto/update.post-comment.dto';

import { UsersEntity } from '../../src/user/entity/users.entity';
import { CategoriesEntity } from '../../src/category/entity/categories.entity';
import { PostsEntity } from '../../src/post/entity/posts.entity';
import { PostsCommentsEntity } from '../../src/comment/entity/post_comments.entity';

import { UsersService } from '../../src/user/service/users.service';
import { CategoriesService } from '../../src/category/service/categories.service';
import { PostsService } from '../../src/post/service/posts.service';
import { PostCommentsService } from '../../src/comment/service/post-comments.service';

import { UserTestEntity } from './test_entities/user.test.entity';
import { CategoryTestEntity } from './test_entities/category.test.entity';
import { PostTestEntity } from './test_entities/post.test.entity';
import { CommentTestEntity } from './test_entities/comment.test.entity';

describe('Posts module', () => {
  let app: INestApplication;

  let usersEntityRepository: Repository<UsersEntity>;
  let categoriesEntityRepository: Repository<CategoriesEntity>;
  let postsEntityRepository: Repository<PostsEntity>;
  let commentsEntityRepository: Repository<PostsCommentsEntity>;

  let usersService: UsersService;
  let categoriesService: CategoriesService;
  let postsService: PostsService;
  let commentsService: PostCommentsService;

  let userTestEntity: UserTestEntity;
  let categoryTestEntity: CategoryTestEntity;
  let postTestEntity: PostTestEntity;
  let commentTestEntity: CommentTestEntity;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        CategoriesModule,
        PostsModule,
        CommentsModule,
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
    categoriesEntityRepository = module.get(getRepositoryToken(CategoriesEntity));
    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    commentsEntityRepository = module.get(getRepositoryToken(PostsCommentsEntity));

    usersService = module.get(UsersService);
    categoriesService = module.get(CategoriesService);
    postsService = module.get(PostsService);
    commentsService = module.get(PostCommentsService);

    userTestEntity = new UserTestEntity(usersService);
    categoryTestEntity = new CategoryTestEntity(categoriesService);
    postTestEntity = new PostTestEntity(postsService);
    commentTestEntity = new CommentTestEntity(commentsService);

    await app.init();
  }, 15000);

  afterEach(async () => {
    await postsEntityRepository.query(`DELETE FROM posts_categories;`);
    await commentsEntityRepository.query(`DELETE FROM posts_comments;`);
    await postsEntityRepository.query(`DELETE FROM posts;`);
    await categoriesEntityRepository.query(`DELETE FROM categories;`);
    await usersEntityRepository.query(`DELETE FROM users;`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /comments/create', async () => {
    const dataBeforeInsert = classToPlain(commentsService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);

    const commentDto = new CreatePostCommentDto(userEntity.id, postEntity.id, 'content_test');

    const expectedObj = {
      id: expect.any(String),
      content: commentDto.content,
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
      post: {
        id: postEntity.id,
        title: postEntity.title,
        content: postEntity.content,
        rating: postEntity.rating,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
      grades: [],
      likes_count: 0,
      dislikes_count: 0,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(app.getHttpServer())
      .post('/comments/create')
      .set('Accept', 'application/json')
      .send(commentDto)
      .expect(201);

    const dataAfterInsert = classToPlain(commentsService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);
  });

  it('GET /comments/post/:id', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const commentEntity = await commentTestEntity.create(userEntity.id, postEntity.id);

    const expectedResponseObj = {
      id: commentEntity.id,
      content: commentEntity.content,
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
      post: {
        id: postEntity.id,
        title: postEntity.title,
        content: postEntity.content,
        rating: postEntity.rating,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      grades: [],
      likes_count: 0,
      dislikes_count: 0,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };

    const response = await request
      .agent(app.getHttpServer())
      .get(`/comments/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);
  });

  it('PATCH /comments/comment/:id', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const commentEntity = await commentTestEntity.create(userEntity.id, postEntity.id);

    const commentDto = new UpdatePostCommentDto('content_test');

    const expectedObj = {
      id: commentEntity.id,
      content: commentDto.content,
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
      post: {
        id: postEntity.id,
        title: postEntity.title,
        content: postEntity.content,
        rating: postEntity.rating,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
      grades: [],
      likes_count: 0,
      dislikes_count: 0,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/comments/comment/${commentEntity.id}`)
      .set('Accept', 'application/json')
      .send(commentDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(commentsService.getAll());
    expect(dataAfterUpdate).resolves.toEqual([expectedObj]);
  });

  it('DELETE /comments/comment/:id', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const commentEntity = await commentTestEntity.create(userEntity.id, postEntity.id);

    await request
      .agent(app.getHttpServer())
      .delete(`/comments/comment/${commentEntity.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterUpdate = classToPlain(commentsService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([]);
  });
});
