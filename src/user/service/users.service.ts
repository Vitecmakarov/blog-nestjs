import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { hash } from 'bcrypt';

import { CreateUserDto } from '../dto/create.user.dto';
import { UpdateUserDto } from '../dto/update.user.dto';

import { UsersEntity } from '../entity/users.entity';
import { UserImagesService } from '../../image/service/user_images.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly userImageService: UserImagesService,
  ) {}

  async create(data: CreateUserDto): Promise<UsersEntity> {
    const user = this.usersRepository.create(data);
    await this.usersRepository.save(user);
    return user;
  }

  async getById(id: string): Promise<UsersEntity> {
    return await this.usersRepository.findOne(id, {
      relations: ['avatar', 'grades'],
    });
  }

  async getByPhoneNumber(phone: string): Promise<UsersEntity> {
    return await this.usersRepository.findOne({
      where: { mobile: phone },
      relations: ['avatar', 'grades'],
    });
  }

  async update(id: string, dataDto: UpdateUserDto): Promise<void> {
    const { avatar, ...dataToUpdate } = dataDto;

    const user = await this.usersRepository.findOne(id, {
      relations: ['avatar', 'grades'],
    });

    if (avatar) {
      if (user.avatar) {
        await this.userImageService.remove(user.avatar.id);
      }
      user.avatar = await this.userImageService.create(avatar);
    }

    await this.usersRepository.save({ ...user, ...dataToUpdate });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const hashedPassword = await hash(password, 10);
    await this.usersRepository.update({ id }, { password: hashedPassword });
  }

  async updateLastLogin(id: string, loginDate: Date): Promise<void> {
    await this.usersRepository.update({ id }, { last_login: loginDate });
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne(id, {
      relations: ['avatar', 'created_posts'],
    });

    if (user.created_posts.length !== 0) {
      await Promise.all(
        user.created_posts.map(async (post) => {
          if (post.image) {
            await this.userImageService.remove(post.image.id);
          }
          return;
        }),
      );
    }

    if (user.avatar) {
      await this.userImageService.remove(user.avatar.id);
    }
    await this.usersRepository.delete(id);
  }

  // Only for tests
  async getAll(): Promise<UsersEntity[]> {
    return await this.usersRepository.find({
      relations: [
        'avatar',
        'created_posts',
        'created_categories',
        'created_comments',
        'grades',
        'users_grades',
        'posts_grades',
        'comments_grades',
      ],
    });
  }
}
