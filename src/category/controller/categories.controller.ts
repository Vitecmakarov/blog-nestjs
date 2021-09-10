import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  NotFoundException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Public } from '../../decorators/jwt.decorator';

import { CreateCategoryDto } from '../dto/create.category.dto';
import { UpdateCategoryDto } from '../dto/update.category.dto';

import { CategoriesEntity } from '../entity/categories.entity';
import { CategoriesService } from '../service/categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create')
  async createCategory(@Body() data: CreateCategoryDto): Promise<void> {
    await this.categoriesService.create(data);
  }

  @Public()
  @Get('all')
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllCategories(): Promise<CategoriesEntity[]> {
    return await this.categoriesService.getAll();
  }

  @Public()
  @Get('category/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCategoryById(@Param('id') id: string): Promise<CategoriesEntity> {
    const category = await this.categoriesService.getById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @Public()
  @Get('user/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCategoriesByUserId(@Param('id') id: string): Promise<CategoriesEntity[]> {
    return await this.categoriesService.getAllByUserId(id);
  }

  @Public()
  @Get('title/:title')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCategoriesByTitle(@Param('title') title: string): Promise<CategoriesEntity[]> {
    return await this.categoriesService.getAllByTitle(title);
  }

  @Patch('category/:id')
  async updateCategory(@Param('id') id: string, @Body() data: UpdateCategoryDto): Promise<void> {
    const category = await this.categoriesService.getById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoriesService.update(id, data);
  }

  @Delete('category/:id')
  async deleteCategory(@Param('id') id: string): Promise<void> {
    const category = await this.categoriesService.getById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoriesService.remove(id);
  }
}
