import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { hash } from 'bcrypt';

import { CreateUserDto } from '../dto/create.user.dto';
import { UpdateUserGradesDto } from '../dto/update.user.grades.dto';
import { UpdateUserDto } from '../dto/update.user.dto';
import { UpdatePasswordDto } from '../dto/update.password.dto';

import { UsersEntity } from '../entity/users.entity';
import { UsersGradesEntity } from '../entity/users.grades.entity';

import { ImagesService } from '../../image/service/images.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(UsersGradesEntity)
    private readonly usersGradesRepository: Repository<UsersGradesEntity>,
    private readonly imagesService: ImagesService,
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
      relations: ['avatar'],
    });

    if (avatar) {
      if (user.avatar) {
        await this.imagesService.remove(user.avatar.id);
      }
      user.avatar = await this.imagesService.create(avatar);
    }

    await this.usersRepository.save({ ...user, ...dataToUpdate });
  }

  async updateRating(evaluated_id: string, data: UpdateUserGradesDto): Promise<void> {
    const prev_grade = await this.usersGradesRepository.findOne({
      where: { estimator: { id: data.estimator_id }, evaluated_user: { id: evaluated_id } },
    });

    if (prev_grade) {
      await this.usersGradesRepository.save({ ...prev_grade, grade: data.grade });
    } else {
      const estimator = await this.usersRepository.findOne(data.estimator_id);
      if (!estimator) {
        throw new NotFoundException('User not found');
      }
      const evaluated_user = await this.usersRepository.findOne(evaluated_id);
      if (!evaluated_user) {
        throw new NotFoundException('Evaluated user not found');
      }

      const estimator_grade = this.usersGradesRepository.create({
        estimator: estimator,
        evaluated_user: evaluated_user,
        grade: data.grade,
      });
      await this.usersGradesRepository.save(estimator_grade);
    }
  }

  async updatePassword(id: string, data: UpdatePasswordDto): Promise<void> {
    const hashedPassword = await hash(data.password, 10);
    await this.usersRepository.update({ id }, { password: hashedPassword });
  }

  async updateLastLogin(id: string, loginDate: Date): Promise<void> {
    await this.usersRepository.update({ id }, { last_login: loginDate });
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne(id, {
      relations: ['avatar'],
    });

    if (user.avatar) {
      await this.imagesService.remove(user.avatar.id);
    }
    await this.usersRepository.delete(id);
  }

  // Only for tests
  async getAll(): Promise<UsersEntity[]> {
    return await this.usersRepository.find({
      relations: ['avatar', 'grades'],
    });
  }
}
