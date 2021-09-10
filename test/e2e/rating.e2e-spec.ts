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
import { RatingModule } from '../../src/rating/rating.module';

import { Repository } from 'typeorm';

import { CreateGradeDto } from '../../src/rating/dto/create.grade.dto';
import { CreateCommentGradeDto } from '../../src/rating/dto/create.comment.grade.dto';

import { CategoriesEntity } from '../../src/category/entity/categories.entity';

import { UsersEntity } from '../../src/user/entity/users.entity';
import { UsersGradesEntity } from '../../src/rating/entity/users.grades.entity';

import { PostsEntity } from '../../src/post/entity/posts.entity';
import { PostsGradesEntity } from '../../src/rating/entity/posts.grades.entity';

import { PostsCommentsEntity } from '../../src/comment/entity/post_comments.entity';
import { PostsCommentsGradesEntity } from '../../src/rating/entity/comment.grades.entity';

import { CategoriesService } from '../../src/category/service/categories.service';
import { UsersService } from '../../src/user/service/users.service';
import { PostsService } from '../../src/post/service/posts.service';
import { PostCommentsService } from '../../src/comment/service/post-comments.service';

import { UserTestEntity } from './test_entities/user.test.entity';
import { CategoryTestEntity } from './test_entities/category.test.entity';
import { PostTestEntity } from './test_entities/post.test.entity';
import { CommentTestEntity } from './test_entities/comment.test.entity';
import { CommentGradeEnum } from '../../src/rating/enums/grades.enums';

config({ path: `./env/.env.${process.env.NODE_ENV}` });

describe('Posts module', () => {
  let app: INestApplication;

  let usersEntityRepository: Repository<UsersEntity>;
  let usersGradesEntityRepository: Repository<UsersGradesEntity>;

  let categoriesEntityRepository: Repository<CategoriesEntity>;

  let postsEntityRepository: Repository<PostsEntity>;
  let postsGradesEntityRepository: Repository<PostsGradesEntity>;

  let postsCommentsEntityRepository: Repository<PostsCommentsEntity>;
  let postsCommentsGradesEntityRepository: Repository<PostsCommentsGradesEntity>;

  let usersService: UsersService;
  let categoriesService: CategoriesService;
  let postsService: PostsService;
  let postCommentsService: PostCommentsService;

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
        RatingModule,
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
    usersGradesEntityRepository = module.get(getRepositoryToken(UsersGradesEntity));

    categoriesEntityRepository = module.get(getRepositoryToken(CategoriesEntity));

    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    postsGradesEntityRepository = module.get(getRepositoryToken(PostsGradesEntity));

    postsCommentsEntityRepository = module.get(getRepositoryToken(PostsCommentsEntity));
    postsCommentsGradesEntityRepository = module.get(getRepositoryToken(PostsCommentsGradesEntity));

    usersService = module.get(UsersService);
    categoriesService = module.get(CategoriesService);
    postsService = module.get(PostsService);
    postCommentsService = module.get(PostCommentsService);

    userTestEntity = new UserTestEntity(usersService);
    categoryTestEntity = new CategoryTestEntity(categoriesService);
    postTestEntity = new PostTestEntity(postsService);
    commentTestEntity = new CommentTestEntity(postCommentsService);

    await app.init();
  }, 15000);

  afterEach(async () => {
    await postsEntityRepository.query(`DELETE FROM posts_categories;`);
    await categoriesEntityRepository.query(`DELETE FROM categories;`);

    await postsCommentsGradesEntityRepository.query(`DELETE FROM posts_comments_grades;`);
    await postsCommentsEntityRepository.query(`DELETE FROM posts_comments;`);

    await postsGradesEntityRepository.query(`DELETE FROM posts_grades;`);
    await postsEntityRepository.query(`DELETE FROM posts;`);

    await usersGradesEntityRepository.query(`DELETE FROM users_grades;`);
    await usersEntityRepository.query(`DELETE FROM users;`);
  });

  afterAll(async () => {
    await app.close();
    const deleteTestImagesDir = promisify(rimraf);
    await deleteTestImagesDir(process.env.PWD + process.env.IMAGES_DIR);
  });

  it('PATCH /rating/add/user/:id', async () => {
    const evaluated = await userTestEntity.create();
    const first_estimator = await userTestEntity.create();
    const second_estimator = await userTestEntity.create();

    const first_grade_dto = new CreateGradeDto(first_estimator.id, 5);
    const first_grade_change_dto = new CreateGradeDto(first_estimator.id, 4);
    const second_grade_dto = new CreateGradeDto(second_estimator.id, 2);

    const expectedObj = {
      id: evaluated.id,
      first_name: evaluated.first_name,
      last_name: evaluated.last_name,
      mobile: evaluated.mobile,
      email: evaluated.email,
      avatar: null,
      profile_desc: evaluated.profile_desc,
      register_at: expect.any(Date),
      last_login: evaluated.last_login,
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/user/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(first_grade_dto)
      .expect(200);

    const dataAfterFirstGrade = classToPlain(usersService.getById(evaluated.id));
    await expect(dataAfterFirstGrade).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      rating: 5,
      ...expectedObj,
    });

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/user/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(first_grade_change_dto)
      .expect(200);

    const dataAfterFirstGradeChange = classToPlain(usersService.getById(evaluated.id));
    await expect(dataAfterFirstGradeChange).resolves.toEqual({
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      rating: 4,
      ...expectedObj,
    });

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/user/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(second_grade_dto)
      .expect(200);

    const dataAfterSecondGrade = classToPlain(usersService.getById(evaluated.id));
    await expect(dataAfterSecondGrade).resolves.toEqual({
      rating: 3,
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      ...expectedObj,
    });
  });

  it('PATCH /rating/add/post/:id', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const evaluated = await postTestEntity.create(userEntity.id, [categoryEntity.id]);

    const first_estimator = await userTestEntity.create();
    const second_estimator = await userTestEntity.create();

    const first_grade_dto = new CreateGradeDto(first_estimator.id, 5);
    const first_grade_change_dto = new CreateGradeDto(first_estimator.id, 4);
    const second_grade_dto = new CreateGradeDto(second_estimator.id, 2);

    const expectedObj = {
      id: expect.any(String),
      title: evaluated.title,
      content: evaluated.content,
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
      comments: [],
      image: null,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/post/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(first_grade_dto)
      .expect(200);

    const dataAfterFirstGrade = classToPlain(postsService.getById(evaluated.id));
    await expect(dataAfterFirstGrade).resolves.toEqual({
      rating: 5,
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      ...expectedObj,
    });

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/post/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(first_grade_change_dto)
      .expect(200);

    const dataAfterFirstGradeChange = classToPlain(postsService.getById(evaluated.id));
    await expect(dataAfterFirstGradeChange).resolves.toEqual({
      rating: 4,
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      ...expectedObj,
    });

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/post/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(second_grade_dto)
      .expect(200);

    const dataAfterSecondGrade = classToPlain(postsService.getById(evaluated.id));
    await expect(dataAfterSecondGrade).resolves.toEqual({
      rating: 3,
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      ...expectedObj,
    });
  });

  it('PATCH /rating/add/comment/:id', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postsEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);
    const evaluated = await commentTestEntity.create(userEntity.id, postsEntity.id);

    const first_estimator = await userTestEntity.create();
    const second_estimator = await userTestEntity.create();

    const first_grade_dto = new CreateCommentGradeDto(first_estimator.id, CommentGradeEnum.DISLIKE);
    const first_grade_change_dto = new CreateCommentGradeDto(
      first_estimator.id,
      CommentGradeEnum.LIKE,
    );
    const second_grade_dto = new CreateCommentGradeDto(second_estimator.id, CommentGradeEnum.LIKE);

    const expectedObj = {
      id: expect.any(String),
      content: evaluated.content,
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
      post: {
        id: postsEntity.id,
        title: postsEntity.title,
        content: postsEntity.content,
        rating: postsEntity.rating,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/comment/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(first_grade_dto)
      .expect(200);

    const dataAfterFirstGrade = classToPlain(postCommentsService.getById(evaluated.id));
    await expect(dataAfterFirstGrade).resolves.toEqual({
      likes_count: 0,
      dislikes_count: 1,
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      ...expectedObj,
    });

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/comment/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(first_grade_change_dto)
      .expect(200);

    const dataAfterFirstGradeChange = classToPlain(postCommentsService.getById(evaluated.id));
    await expect(dataAfterFirstGradeChange).resolves.toEqual({
      likes_count: 1,
      dislikes_count: 0,
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      ...expectedObj,
    });

    await request
      .agent(app.getHttpServer())
      .patch(`/rating/add/comment/${evaluated.id}`)
      .set('Accept', 'application/json')
      .send(second_grade_dto)
      .expect(200);

    const dataAfterSecondGrade = classToPlain(postCommentsService.getById(evaluated.id));
    await expect(dataAfterSecondGrade).resolves.toEqual({
      likes_count: 2,
      dislikes_count: 0,
      grades: [
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
        {
          id: expect.any(String),
          grade: expect.any(Number),
        },
      ],
      ...expectedObj,
    });
  });
});
