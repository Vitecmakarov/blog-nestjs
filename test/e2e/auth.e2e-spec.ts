import { classToPlain } from 'class-transformer';
import { config } from 'dotenv';

import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../../src/user/users.module';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

import { Repository } from 'typeorm';

import { CreateUserDto } from '../../src/user/dto/users.dto';
import { UsersEntity } from '../../src/user/users.entity';
import { UsersService } from '../../src/user/users.service';
import { UserTestEntity } from './test_entities/user.test.entity';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';

config({ path: `./env/.env.${process.env.NODE_ENV}` });

describe('Auth module', () => {
  let app: INestApplication;

  let usersEntityRepository: Repository<UsersEntity>;
  let usersService: UsersService;
  let userTestEntity: UserTestEntity;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        AuthModule,
        PassportModule,
        JwtModule.register({
          secret: `${process.env.JWT_SECRET}`,
          signOptions: { expiresIn: `${process.env.TOKEN_LIFETIME}s` },
        }),
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
      providers: [
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    usersEntityRepository = module.get(getRepositoryToken(UsersEntity));
    usersService = module.get(UsersService);
    userTestEntity = new UserTestEntity(usersService);

    await app.init();
  }, 15000);

  afterEach(async () => {
    await usersEntityRepository.query(`DELETE FROM users;`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register', async () => {
    const dataBeforeInsert = classToPlain(usersService.getAll());
    await expect(dataBeforeInsert).resolves.toEqual([]);

    const userDto = new CreateUserDto(
      'first_name_test',
      'last_name_test',
      'mobile_test',
      'email_test',
      'password_test',
    );

    const expectedObj = {
      id: expect.any(String),
      first_name: userDto.first_name,
      last_name: userDto.last_name,
      mobile: userDto.mobile,
      email: userDto.email,
      created_posts: [],
      created_categories: [],
      created_comments: [],
      avatar: null,
      register_at: expect.any(Date),
      last_login: null,
      profile_desc: null,
      is_banned: false,
    };

    await request
      .agent(app.getHttpServer())
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(userDto)
      .expect(201);

    const promiseUser = usersService.getAll();

    const dataAfterInsert = classToPlain(promiseUser);
    await expect(dataAfterInsert).resolves.toEqual([expectedObj]);

    const [user] = await promiseUser;

    const isPasswordSavedCorrectly = await bcrypt.compare(userDto.password, user.password);
    if (!isPasswordSavedCorrectly) {
      throw new Error('Password is not saved correctly');
    }
  });

  it('POST /auth/login', async () => {
    const userEntity = await userTestEntity.create();

    await request
      .agent(app.getHttpServer())
      .delete(`/user/${userEntity.id}`)
      .set('Accept', 'application/json')
      .expect(401);

    const { body } = await request
      .agent(app.getHttpServer())
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({ mobile: userEntity.mobile, password: 'password_test' })
      .expect(201);
    expect(body).toEqual({
      access_token: expect.any(String),
    });

    const [userDataAfterLogin] = await usersService.getAll();
    expect(userDataAfterLogin.last_login).toEqual(expect.any(Date));

    const token = body.access_token;

    await request
      .agent(app.getHttpServer())
      .delete(`/user/${userEntity.id}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });
});
