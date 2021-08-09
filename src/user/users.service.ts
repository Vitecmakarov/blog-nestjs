import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageAction, CreateImageDto } from '../image/dto/images.dto';
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

  async create(data: CreateUserDto): Promise<void> {
    const user = this.usersRepository.create(data);
    await this.usersRepository.save(user);
  }

  async getById(id: string): Promise<UsersEntity> {
    return await this.usersRepository.findOne(id, {
      relations: [
        'created_posts',
        'created_categories',
        'created_comments',
        'avatars',
      ],
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<void> {
    const user = await this.usersRepository.findOne(id);

    const { avatar_actions, ...dataToUpdate } = data;
    if (avatar_actions.length !== 0) {
      await Promise.all(
        avatar_actions.map(async (avatar_action) => {
          switch (avatar_action.action) {
            case ImageAction.ADD:
              const image = await this.imageService.create(
                avatar_action.data as CreateImageDto,
              );
              user.avatars.push(image);
              break;
            case ImageAction.DELETE:
              const id = avatar_action.data as string;
              user.avatars = user.avatars.filter((avatar) => {
                return avatar.id !== id;
              });
              await this.imageService.remove(id);
              break;
          }
        }),
      );
    }
    await this.usersRepository.save({ ...user, ...dataToUpdate });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.usersRepository.update({ id }, { password: password });
  }

  async updateLastLogin(id: string, loginDate: string): Promise<void> {
    await this.usersRepository.update({ id }, { last_login: loginDate });
  }

  async remove(id: string): Promise<void> {
    const { avatars } = await this.usersRepository.findOne(id);
    await Promise.all(
      avatars.map(async (avatar) => {
        await this.imageService.remove(avatar.id);
      }),
    );
    await this.usersRepository.delete(id);
  }

  // Only for development!
  async getAll(): Promise<UsersEntity[]> {
    return await this.usersRepository.find({
      relations: [
        'created_posts',
        'created_categories',
        'created_comments',
        'avatars',
      ],
    });
  }
}
