import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesDto } from './dto/categories.dto';
import { CategoriesEntity } from './categories.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private categoriesRepository: Repository<CategoriesEntity>,
  ) {}

  async create(data: CategoriesDto): Promise<void> {
    const user = this.categoriesRepository.create(data);
    await this.categoriesRepository.save(user);
  }

  async getAll(): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find();
  }

  async getById(id: string): Promise<CategoriesEntity> {
    return await this.categoriesRepository.findOne(id);
  }

  async getByTitle(title: string): Promise<CategoriesEntity[]> {
    return await this.categoriesRepository.find({ where: { title: title } });
  }

  async update(id: string, data: CategoriesDto): Promise<void> {
    await this.categoriesRepository.update({ id }, data);
  }

  async remove(id: string): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}
