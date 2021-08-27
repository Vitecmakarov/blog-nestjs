import { promisify } from 'util';
import { config } from 'dotenv';

import * as rimraf from 'rimraf';
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

import { UserTestEntity } from './test_entities/user.test.entity';
import { CategoryTestEntity } from './test_entities/category.test.entity';
import { PostTestEntity } from './test_entities/post.test.entity';
import { ImageTestDto } from './test_entities/image.test.dto';

config({ path: `./env/.env.${process.env.NODE_ENV}` });

describe('Categories module', () => {
  let app: INestApplication;

  let imagesEntityRepository: Repository<ImagesEntity>;
  let categoriesEntityRepository: Repository<CategoriesEntity>;
  let usersEntityRepository: Repository<UsersEntity>;
  let postsEntityRepository: Repository<PostsEntity>;

  let categoriesService: CategoriesService;
  let usersService: UsersService;
  let postsService: PostsService;

  let userTestEntity: UserTestEntity;
  let categoryTestEntity: CategoryTestEntity;
  let postTestEntity: PostTestEntity;
  let imageTestDto: ImageTestDto;

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

    usersEntityRepository = module.get(getRepositoryToken(UsersEntity));
    categoriesEntityRepository = module.get(getRepositoryToken(CategoriesEntity));
    postsEntityRepository = module.get(getRepositoryToken(PostsEntity));
    imagesEntityRepository = module.get(getRepositoryToken(ImagesEntity));

    usersService = module.get(UsersService);
    postsService = module.get(PostsService);
    categoriesService = module.get(CategoriesService);

    userTestEntity = new UserTestEntity(usersService);
    categoryTestEntity = new CategoryTestEntity(categoriesService);
    postTestEntity = new PostTestEntity(postsService);
    imageTestDto = new ImageTestDto();

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
    const deleteTestImagesDir = promisify(rimraf);
    await deleteTestImagesDir(process.env.PWD + process.env.IMAGES_DIR);
  });

  it('GET (/images/image/:id, /images/post/:id, /images/user/:id)', async () => {
    const userEntity = await userTestEntity.create();
    const categoryEntity = await categoryTestEntity.create(userEntity.id);
    const imageDto = await imageTestDto.create();
    const postEntity = await postTestEntity.create(userEntity.id, [categoryEntity.id], imageDto);

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
