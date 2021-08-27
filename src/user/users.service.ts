import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { hash } from 'bcrypt';

import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { UsersEntity } from './users.entity';

import { ImagesService } from '../image/images.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly imageService: ImagesService,
  ) {}

  async create(data: CreateUserDto): Promise<UsersEntity> {
    const user = this.usersRepository.create(data);
    await this.usersRepository.save(user);
    return user;
  }

  async getById(id: string): Promise<UsersEntity> {
    return await this.usersRepository.findOne(id, {
      relations: ['created_posts', 'created_categories', 'created_comments', 'avatar'],
    });
  }

  async update(id: string, dataDto: UpdateUserDto): Promise<void> {
    const { avatar, ...dataToUpdate } = dataDto;

    const user = await this.usersRepository.findOne(id, {
      relations: ['avatar'],
    });

    if (!user) {
      throw new NotFoundException('User with this id is not exist');
    }

    if (avatar) {
      if (user.avatar) {
        await this.imageService.remove(user.avatar.id);
      }
      user.avatar = await this.imageService.create(avatar);
    }
    await this.usersRepository.save({ ...user, ...dataToUpdate });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const hashedPassword = await hash(password, 10);
    await this.usersRepository.update({ id }, { password: hashedPassword });
  }

  async updateLastLogin(id: string, loginDate: string): Promise<void> {
    await this.usersRepository.update({ id }, { last_login: loginDate });
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne(id, {
      relations: ['avatar', 'created_posts', 'created_comments'],
    });

    if (user.created_posts.length !== 0) {
      await Promise.all(
        user.created_posts.map(async (post) => {
          if (post.image) {
            await this.imageService.remove(post.image.id);
          }
          return;
        }),
      );
    }

    if (user.avatar) {
      await this.imageService.remove(user.avatar.id);
    }

    await this.usersRepository.delete(id);
  }

  // Only for tests
  async getAll(): Promise<UsersEntity[]> {
    return await this.usersRepository.find({
      relations: ['created_posts', 'created_categories', 'created_comments', 'avatar'],
    });
  }
}
