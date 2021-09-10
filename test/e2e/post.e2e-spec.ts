import { promisify } from 'util';
import { classToPlain } from 'class-transformer';
import { config } from 'dotenv';

import * as rimraf from 'rimraf';
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

import { CreatePostDto } from '../../src/post/dto/create.post.dto';
import { UpdatePostDto } from '../../src/post/dto/update.post.dto';
import { UpdatePostCategoryAction } from '../../src/post/dto/update.category.dto';

import { PostCategoryAction } from '../../src/post/enums/posts.enums';

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
import { ImageTestDto } from './test_entities/image.test.dto';

config({ path: `./env/.env.${process.env.NODE_ENV}` });

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
  let imageTestDto: ImageTestDto;

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
    imageTestDto = new ImageTestDto();

    await app.init();
  }, 15000);

  afterEach(async () => {
    await postsEntityRepository.query(`DELETE FROM posts_categories;`);
    await categoriesEntityRepository.query(`DELETE FROM categories;`);
    await commentsEntityRepository.query(`DELETE FROM posts_comments;`);
    await postsEntityRepository.query(`DELETE FROM posts;`);
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

    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);

    const imageDto = await imageTestDto.create();
    const postDto = new CreatePostDto(
      userEntity.id,
      [categoryEntity.id],
      'title_test',
      'content_test',
      imageDto,
    );

    const expectedObj = {
      id: expect.any(String),
      title: postDto.title,
      content: postDto.content,
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
      categories: [
        {
          id: categoryEntity.id,
          title: categoryEntity.title,
        },
      ],
      grades: [],
      comments: [],
      image: {
        id: expect.any(String),
        path: expect.any(String),
        size: expect.any(Number),
        extension: expect.any(String),
        upload_timestamp: expect.any(Date),
      },
      rating: 0,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(app.getHttpServer())
      .post('/posts/create')
      .set('Accept', 'application/json')
      .send(postDto)
      .expect(201);

    const dataAfterInsert = classToPlain(postsService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);
  });

  it('GET (/posts/all, /posts/post/:id, /posts/category/:id)', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const commentEntity = await commentTestEntity.create(userEntity.id, postEntity.id);

    const expectedResponseObj = {
      id: postEntity.id,
      title: postEntity.title,
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
      categories: [
        {
          id: categoryEntity.id,
          title: categoryEntity.title,
        },
      ],
      grades: [],
      comments: [
        {
          id: commentEntity.id,
          content: commentEntity.content,
          likes_count: commentEntity.likes_count,
          dislikes_count: commentEntity.dislikes_count,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ],
      image: null,
      rating: postEntity.rating,
      content: postEntity.content,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };

    let response = await request
      .agent(app.getHttpServer())
      .get('/posts/all')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);

    response = await request
      .agent(app.getHttpServer())
      .get(`/posts/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual(expectedResponseObj);

    response = await request
      .agent(app.getHttpServer())
      .get(`/posts/category/${categoryEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual([expectedResponseObj]);
  });

  it('PATCH /posts/post/:id', async () => {
    const userEntity = await userTestEntity.create();
    const firstCategoryEntity = await categoryTestEntity.create(userEntity.id);
    const secondCategoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [firstCategoryEntity.id]);

    const addCategoryAction = new UpdatePostCategoryAction(
      PostCategoryAction.ADD,
      secondCategoryEntity.id,
    );

    const deleteCategoryAction = new UpdatePostCategoryAction(
      PostCategoryAction.DELETE,
      firstCategoryEntity.id,
    );

    const imageDto = await imageTestDto.create();
    const postDto = new UpdatePostDto(
      [addCategoryAction, deleteCategoryAction],
      'title_test',
      'content_test',
      imageDto,
    );

    const expectedObj = {
      id: postEntity.id,
      title: postDto.title,
      content: postDto.content,
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
      categories: [
        {
          id: secondCategoryEntity.id,
          title: secondCategoryEntity.title,
        },
      ],
      grades: [],
      comments: [],
      image: {
        id: expect.any(String),
        path: expect.any(String),
        extension: expect.any(String),
        size: expect.any(Number),
        upload_timestamp: expect.any(Date),
      },
      rating: 0,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/posts/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .send(postDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(postsService.getAll());
    expect(dataAfterUpdate).resolves.toEqual([expectedObj]);
  });

  it('DELETE /posts/post/:id', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);
    await commentTestEntity.create(userEntity.id, postEntity.id);

    await request
      .agent(app.getHttpServer())
      .delete(`/posts/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterUpdate = classToPlain(postsService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([]);

    const [categoriesAfterPostDelete] = await categoriesService.getAll();
    await expect(categoriesAfterPostDelete).toEqual(expect.any(CategoriesEntity));
  });
});
