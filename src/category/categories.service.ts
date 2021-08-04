import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from "typeorm";

import { CreateCategoriesDto, UpdateCategoriesDto } from './dto/categories.dto';

import { CategoriesEntity } from './categories.entity';
import { UsersEntity } from '../user/users.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private categoriesRepository: Repository<CategoriesEntity>,
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async create(data: CreateCategoriesDto): Promise<void> {
    const { user_id, ...categoryData } = data;

    const category = this.categoriesRepository.create(categoryData);

    category.user = await this.usersRepository.findOne(user_id);

    await this.categoriesRepository.save(category);
  }

  async getAll(): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find({
      relations: ['user', 'posts'],
    });
  }

  async getById(id: number): Promise<CategoriesEntity> {
    return await this.categoriesRepository.findOne(id, {
      relations: ['user', 'posts'],
    });
  }

  async getAllByUserId(id: string): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find({
      where: { user: { id: id } },
      relations: ['user', 'posts'],
    });
  }

  async getAllByTitle(title: string): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find({
      where: { title: title },
      relations: ['user', 'posts'],
    });
  }

  async update(id: number, data: UpdateCategoriesDto): Promise<void> {
    await this.categoriesRepository.update({ id }, data);
  }

  async remove(id: number): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}
