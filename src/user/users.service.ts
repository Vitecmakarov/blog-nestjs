import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    return await this.usersRepository.findOne(id);
  }

  async update(id: string, dataDto: UpdateUserDto): Promise<void> {
    const { avatar, ...dataToUpdate } = dataDto;

    const user = await this.usersRepository.findOne(id);

    if (user) {
      throw new NotFoundException('User with this id is not exist');
    }

    if (user.avatar) {
      await this.imageService.remove(user.avatar.id);
    }
    user.avatar = await this.imageService.create(avatar);
    await this.usersRepository.save({ ...user, ...dataToUpdate });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.usersRepository.update({ id }, { password: password });
  }

  async updateLastLogin(id: string, loginDate: string): Promise<void> {
    await this.usersRepository.update({ id }, { last_login: loginDate });
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne(id);

    if (user) {
      throw new NotFoundException('User with this id is not exist');
    }

    if (user.avatar) {
      await this.imageService.remove(user.avatar.id);
    }
    await this.usersRepository.delete(id);
  }

  // Only for development!
  async getAll(): Promise<UsersEntity[]> {
    return await this.usersRepository.find();
  }
}
