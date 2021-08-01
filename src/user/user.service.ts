import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(data: UserDto): Promise<void> {
    const user = this.usersRepository.create(data);
    await this.usersRepository.save(user);
  }

  async getById(id: string): Promise<UserEntity> {
    return await this.usersRepository.findOne(id);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.usersRepository.update({ id }, { password: newPassword });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // async updateFirstName(id: string, firstName: string): Promise<void> {
  //   await this.usersRepository.update({ id }, { first_name: firstName });
  // }
  //
  // async updateLastName(id: string, lastName: string): Promise<void> {
  //   await this.usersRepository.update({ id }, { last_name: lastName });
  // }
  //
  // async updateProfileDesc(id: string, profileDesc: string): Promise<void> {
  //   await this.usersRepository.update({ id }, { profile_desc: profileDesc });
  // }

  // Only for development
  async getAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  // TODO: Think about rigid or flexible structure
  // async update(id: string, data: Partial<UserDto>): Promise<void> {
  //   await this.usersRepository.update({ id }, data);
  // }
}
