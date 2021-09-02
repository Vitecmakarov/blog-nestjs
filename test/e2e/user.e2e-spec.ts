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

import { UpdateUserDto, UpdateUserPasswordDto } from '../../src/user/dto/users.dto';

import { UsersEntity } from '../../src/user/users.entity';
import { CategoriesEntity } from '../../src/category/categories.entity';
import { PostsEntity } from '../../src/post/posts.entity';
import { CommentsEntity } from '../../src/comment/comments.entity';

import { UsersService } from '../../src/user/users.service';
import { CategoriesService } from '../../src/category/categories.service';
import { PostsService } from '../../src/post/posts.service';
import { CommentsService } from '../../src/comment/comments.service';

import { UserTestEntity } from './test_entities/user.test.entity';
import { CategoryTestEntity } from './test_entities/category.test.entity';
import { PostTestEntity } from './test_entities/post.test.entity';
import { CommentTestEntity } from './test_entities/comment.test.entity';
import { ImageTestDto } from './test_entities/image.test.dto';

config({ path: `./env/.env.${process.env.NODE_ENV}` });

describe('Users module', () => {
  let app: INestApplication;

  let usersEntityRepository: Repository<UsersEntity>;
  let categoriesEntityRepository: Repository<CategoriesEntity>;
  let postsEntityRepository: Repository<PostsEntity>;
  let commentsEntityRepository: Repository<CommentsEntity>;

  let usersService: UsersService;
  let categoriesService: CategoriesService;
  let postsService: PostsService;
  let commentsService: CommentsService;

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
    commentsEntityRepository = module.get(getRepositoryToken(CommentsEntity));

    usersService = module.get(UsersService);
    categoriesService = module.get(CategoriesService);
    postsService = module.get(PostsService);
    commentsService = module.get(CommentsService);

    userTestEntity = new UserTestEntity(usersService);
    categoryTestEntity = new CategoryTestEntity(categoriesService);
    postTestEntity = new PostTestEntity(postsService);
    commentTestEntity = new CommentTestEntity(commentsService);
    imageTestDto = new ImageTestDto();

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

  it('GET /user/:id', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id]);
    await commentTestEntity.create(userEntity.id, postEntity.id);

    const expectedResponseObj = {
      id: userEntity.id,
      first_name: userEntity.first_name,
      last_name: userEntity.last_name,
      mobile: userEntity.mobile,
      email: userEntity.email,
      avatar: null,
      register_at: expect.any(String),
      last_login: userEntity.last_login,
      profile_desc: userEntity.profile_desc,
      is_banned: userEntity.is_banned,
    };

    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual(expectedResponseObj);
  });

  it('PATCH /user/:id', async () => {
    const userEntity = await userTestEntity.create();
    const imageDto = await imageTestDto.create();

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
      .patch(`/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .send(userDto)
      .expect(200);

    const dataAfterUpdate = classToPlain(usersService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([expectedObj]);
  });

  it('PATCH /user/:id/pass/change', async () => {
    let user = await userTestEntity.create();
    const userDto = new UpdateUserPasswordDto('new_password');

    await request
      .agent(app.getHttpServer())
      .patch(`/user/${user.id}/pass/change`)
      .set('Accept', 'application/json')
      .send(userDto)
      .expect(200);

    [user] = await usersService.getAll();

    const isPasswordChanged = await bcrypt.compare(userDto.password, user.password);
    if (!isPasswordChanged) {
      throw new Error('Password is not changed');
    }
  });

  it('DELETE /user/:id', async () => {
    const user = await userTestEntity.create();
    const category = await categoryTestEntity.create(user.id);
    const post = await postTestEntity.create(user.id, [category.id]);
    await commentTestEntity.create(user.id, post.id);

    await request
      .agent(app.getHttpServer())
      .delete(`/user/${user.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    const dataAfterDelete = usersService.getAll();
    await expect(dataAfterDelete).resolves.toEqual([]);
  });
});
