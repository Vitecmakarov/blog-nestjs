import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryDto } from '../dto/create.category.dto';
import { UpdateCategoryDto } from '../dto/update.category.dto';

import { CategoriesEntity } from '../entity/categories.entity';
import { UsersService } from '../../user/service/users.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
    private readonly usersService: UsersService,
  ) {}

  async create(dataDto: CreateCategoryDto): Promise<CategoriesEntity> {
    const { user_id, ...category_data } = dataDto;

    const category = this.categoriesRepository.create(category_data);

    category.user = await this.usersService.getById(user_id);
    if (!category.user) {
      throw new NotFoundException('User not found');
    }
    await this.categoriesRepository.save(category);

    return category;
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

  async getAllByTitle(title: string): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find({
      where: [{ title: title }],
      relations: ['user', 'posts'],
    });
  }

  async update(id: string, dataDto: UpdateCategoryDto): Promise<void> {
    await this.categoriesRepository.update({ id }, dataDto);
  }

  async remove(id: string): Promise<void> {
    await this.categoriesRepository.delete(id);
  }

  // Only for tests
  async getAll(): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find({
      relations: ['user', 'posts'],
    });
  }
}
