import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { UsersEntity } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async create(data: CreateUserDto): Promise<void> {
    const user = this.usersRepository.create(data);
    await this.usersRepository.save(user);
  }

  async getById(id: string): Promise<UsersEntity> {
    return await this.usersRepository.findOne(id, {
      relations: ['created_posts', 'created_categories', 'created_comments'],
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<void> {
    await this.usersRepository.update({ id }, data);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.usersRepository.update({ id }, { password: newPassword });
  }

  async updateLastLogin(id: string, loginDate: string): Promise<void> {
    await this.usersRepository.update({ id }, { last_login: loginDate });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Only for development!
  async getAll(): Promise<UsersEntity[]> {
    return await this.usersRepository.find({
      relations: ['created_posts', 'created_categories', 'created_comments'],
    });
  }
}
