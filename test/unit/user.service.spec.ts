import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersEntity } from '../../src/user/users.entity';
import { ImagesEntity } from '../../src/image/images.entity';

import { UsersService } from '../../src/user/users.service';
import { ImagesService } from '../../src/image/images.service';

const usersArr = [new UsersEntity(), new UsersEntity(), new UsersEntity()];

const oneUser = new UsersEntity();

describe('UserService', () => {
  let usersService: UsersService;
  let usersRepository: MockType<Repository<UsersEntity>>;

  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    find: jest.fn().mockResolvedValue(usersArr),
    findOne: jest.fn().mockResolvedValue(oneUser),
    create: jest.fn().mockResolvedValue(oneUser),
    save: jest.fn(),
    update: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue(true),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UsersEntity),
          useFactory: repositoryMockFactory,
        },
        ImagesService,
        {
          provide: getRepositoryToken(ImagesEntity),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UsersEntity));
  });

  it('defined', () => {
    expect(usersService).toBeDefined();
  });

  it('create', async () => {
    const repoSpy = jest.spyOn(usersRepository, 'create');
    await expect(
      usersService.create({
        first_name: 'first_name_test',
        last_name: 'last_name_test',
        mobile: 'mobile_test',
        email: 'email_test',
        password: 'password_test',
      }),
    ).resolves.toEqual({});
    expect(repoSpy).toBeCalledWith({
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      password: 'password_test',
    });
  });

  it('getAll', async () => {
    const repoSpy = jest.spyOn(usersRepository, 'find');
    await expect(usersService.getAll()).resolves.toEqual(usersArr);
    expect(repoSpy).toBeCalledWith({
      relations: ['created_posts', 'created_categories', 'created_comments', 'avatar'],
    });
  });

  it('getById', async () => {
    const repoSpy = jest.spyOn(usersRepository, 'findOne');
    await expect(usersService.getById('a uuid')).resolves.toEqual(oneUser);
    expect(repoSpy).toBeCalledWith('a uuid', {
      relations: ['created_posts', 'created_categories', 'created_comments', 'avatar'],
    });
  });

  it('update', async () => {
    const repoSpy = jest.spyOn(usersRepository, 'findOne');
    const updatedUser = await usersService.update('a uuid', {
      first_name: 'first_name_test_changed',
      last_name: 'last_name_test_changed',
      profile_desc: 'this is test description',
    });
    expect(updatedUser).toEqual(undefined);
    expect(repoSpy).toBeCalledWith('a uuid', {
      relations: ['avatar'],
    });
  });

  it('updatePassword', async () => {
    // const repoSpy = jest.spyOn(usersRepository, 'update');
    const updatedUser = await usersService.updatePassword('a uuid', 'new_password');
    expect(updatedUser).toEqual(undefined);
    // expect(repoSpy).toBeCalledWith(
    //   { id: 'a uuid' },
    //   {
    //     password: 'new_password',
    //   },
    // );
  });

  it('updateLastLogin', async () => {
    const repoSpy = jest.spyOn(usersRepository, 'update');
    const updatedUser = await usersService.updateLastLogin('a uuid', 'login_date');
    expect(updatedUser).toEqual(undefined);
    expect(repoSpy).toBeCalledWith(
      { id: 'a uuid' },
      {
        last_login: 'login_date',
      },
    );
  });

  it('remove', () => {
    const repoSpy = jest.spyOn(usersRepository, 'findOne');
    expect(usersService.remove('a uuid')).resolves.toEqual(undefined);
    expect(repoSpy).toBeCalledWith('a uuid', {
      relations: ['avatar', 'created_posts', 'created_comments'],
    });
  });
});

type MockType<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]?: jest.Mock<{}>;
};
