import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoriesDto, UpdateCategoriesDto } from './dto/categories.dto';
import { CategoriesEntity } from './categories.entity';
import { UsersService } from '../user/users.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
    private readonly usersService: UsersService,
  ) {}

  async create(dataDto: CreateCategoriesDto): Promise<void> {
    const { user_id, ...category_data } = dataDto;

    const category = this.categoriesRepository.create(category_data);

    category.user = await this.usersService.getById(user_id);

    if (!category.user) {
      throw new NotFoundException('User with this id is not exist');
    }

    await this.categoriesRepository.save(category);
  }

  async getById(id: string): Promise<CategoriesEntity> {
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

  async getAllByUserIdAndTitle(
    id: string,
    title: string,
  ): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find({
      where: [{ user: { id: id } }, { title: title }],
      relations: ['user', 'posts'],
    });
  }

  async update(id: string, dataDto: UpdateCategoriesDto): Promise<void> {
    await this.categoriesRepository.update({ id }, dataDto);
  }

  async remove(id: string): Promise<void> {
    await this.categoriesRepository.delete(id);
  }

  // Only for develop
  async getAll(): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find({
      relations: ['user', 'posts'],
    });
  }
}
