import { lookup } from 'mime-types';
import { basename } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { classToPlain } from 'class-transformer';

import * as dotenv from 'dotenv';
dotenv.config({ path: `./env/.env.${process.env.NODE_ENV}` });

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as rimraf from 'rimraf';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { UsersEntity } from '../../src/user/users.entity';
import { UsersService } from '../../src/user/users.service';
import { UsersModule } from '../../src/user/users.module';

describe('Users module', () => {
  let app: INestApplication;
  let usersService: UsersService;

  let usersRepository: Repository<UsersEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
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
    usersRepository = module.get(getRepositoryToken(UsersEntity));
    await app.init();
  }, 10000);

  afterEach(async () => {
    await usersRepository.query(`DELETE FROM users;`);
  });

  afterAll(async () => {
    await app.close();
    const deleteTestImagesDir = promisify(rimraf);
    await deleteTestImagesDir(process.env.PWD + process.env.IMAGES_DIR);
  });

  it('POST /users/register', async () => {
    const dataBeforeInsert = classToPlain(usersService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    await request
      .agent(app.getHttpServer())
      .post('/users/register')
      .set('Accept', 'application/json')
      .send({
        first_name: 'first_name_test',
        last_name: 'last_name_test',
        mobile: 'mobile_test',
        email: 'email_test',
        password: 'password_test',
      })
      .expect(201);

    const dataAfterInsert = classToPlain(usersService.getAll());
    await expect(dataAfterInsert).resolves.toEqual([
      {
        id: expect.any(String),
        first_name: 'first_name_test',
        last_name: 'last_name_test',
        mobile: 'mobile_test',
        email: 'email_test',
        created_posts: [],
        created_categories: [],
        created_comments: [],
        avatar: null,
        register_at: expect.any(Date),
        last_login: null,
        profile_desc: null,
        is_banned: false,
      },
    ]);
  });

  it('GET /users/user/:id', async () => {
    await usersService.create({
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      password: 'password_test',
    });

    const [{ id }] = await usersService.getAll();

    const { body } = await request
      .agent(app.getHttpServer())
      .get(`/users/user/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual({
      id: expect.any(String),
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      created_posts: [],
      created_categories: [],
      created_comments: [],
      avatar: null,
      register_at: expect.any(String),
      last_login: null,
      profile_desc: null,
      is_banned: false,
    });
  });

  it('PATCH /users/user/:id', async () => {
    await usersService.create({
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      password: 'password_test',
    });

    const [{ id }] = await usersService.getAll();

    const read = promisify(readFile);
    const pathToTestFile = `${__dirname}/test_image.png`;

    const image_data = await read(pathToTestFile, { encoding: 'base64' });
    const test_image = {
      filename: basename(pathToTestFile),
      type: lookup(pathToTestFile),
      data: image_data,
    };

    await request
      .agent(app.getHttpServer())
      .patch(`/users/user/${id}`)
      .set('Accept', 'application/json')
      .send({
        first_name: 'first_name_test_changed',
        last_name: 'last_name_test_changed',
        profile_desc: 'this is test description',
        avatar: test_image,
      })
      .expect(200);

    const dataAfterUpdate = classToPlain(usersService.getAll());
    await expect(dataAfterUpdate).resolves.toEqual([
      {
        id: expect.any(String),
        first_name: 'first_name_test_changed',
        last_name: 'last_name_test_changed',
        mobile: 'mobile_test',
        email: 'email_test',
        created_posts: [],
        created_categories: [],
        created_comments: [],
        avatar: {
          id: expect.any(String),
          path: expect.any(String),
          size: expect.any(Number),
          extension: expect.any(String),
          upload_timestamp: expect.any(Date),
        },
        register_at: expect.any(Date),
        last_login: null,
        profile_desc: 'this is test description',
        is_banned: expect.any(Boolean),
      },
    ]);
  });

  it('PATCH /users/pass/user/:id', async () => {
    await usersService.create({
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      password: 'password_test',
    });

    let [user] = await usersService.getAll();

    await request
      .agent(app.getHttpServer())
      .patch(`/users/pass/user/${user.id}`)
      .set('Accept', 'application/json')
      .send({ password: 'new_password' })
      .expect(200);

    [user] = await usersService.getAll();

    const isPasswordChanged = await bcrypt.compare(
      'new_password',
      user.password,
    );
    if (!isPasswordChanged) {
      throw new Error('Password is not changed');
    }
  });

  it('DELETE /users/user/:id', async () => {
    await usersService.create({
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      password: 'password_test',
    });

    const [{ id }] = await usersService.getAll();

    await request
      .agent(app.getHttpServer())
      .delete(`/users/user/${id}`)
      .set('Accept', 'application/json')
      .expect(200);
    const dataAfterDelete = usersService.getAll();
    await expect(dataAfterDelete).resolves.toEqual([]);
  });
});
