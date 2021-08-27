import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../../src/image/images.module';
import { PostsModule } from '../../src/post/posts.module';
import { CategoriesModule } from '../../src/category/categories.module';
import { UsersModule } from '../../src/user/users.module';

import { ImagesEntity } from '../../src/image/images.entity';
import { PostsEntity } from '../../src/post/posts.entity';
import { CategoriesEntity } from '../../src/category/categories.entity';
import { UsersEntity } from '../../src/user/users.entity';

import { PostsService } from '../../src/post/posts.service';
import { CategoriesService } from '../../src/category/categories.service';
import { UsersService } from '../../src/user/users.service';

import { TestEntities } from './test_entities/test.entites';

describe('Categories module', () => {
  let app: INestApplication;

  let testEntities: TestEntities;

  let categoriesService: CategoriesService;
  let usersService: UsersService;
  let postsService: PostsService;

  let imagesEntityRepository: Repository<ImagesEntity>;
  let categoriesEntityRepository: Repository<CategoriesEntity>;
  let usersEntityRepository: Repository<UsersEntity>;
  let postsEntityRepository: Repository<PostsEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ImagesModule,
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
    categoriesEntityRepository = module.get(getRepositoryToken(CategoriesEntity));
    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    imagesEntityRepository = module.get(getRepositoryToken(ImagesEntity));

    testEntities = new TestEntities(usersService, categoriesService, postsService);

    await app.init();
  }, 15000);

  afterEach(async () => {
    await postsEntityRepository.query(`DELETE FROM posts_categories;`);
    await postsEntityRepository.query(`DELETE FROM posts;`);
    await categoriesEntityRepository.query(`DELETE FROM posts;`);
    await usersEntityRepository.query(`DELETE FROM users;`);
    await imagesEntityRepository.query(`DELETE FROM images;`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET (/images/image/:id, /images/post/:id, /images/user/:id)', async () => {
    const userEntity = await testEntities.createTestUserEntity();
    const categoryEntity = await testEntities.createTestCategoryEntity(userEntity.id);
    const imageDto = await testEntities.createTestImageDto();
    const postEntity = await testEntities.createTestPostEntity(userEntity.id, [categoryEntity.id], imageDto);

    await usersService.update(userEntity.id, {
      avatar: imageDto,
    });

    let response = await request
      .agent(app.getHttpServer())
      .get(`/images/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /octet-stream/)
      .expect(200);
    expect(response.body).toEqual(expect.any(Buffer));

    response = await request
      .agent(app.getHttpServer())
      .get(`/images/post/${postEntity.id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /octet-stream/)
      .expect(200);
    expect(response.body).toEqual(expect.any(Buffer));
  });
});
