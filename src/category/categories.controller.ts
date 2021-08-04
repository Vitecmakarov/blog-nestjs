import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';

import {
  CreateCategoriesDto,
  UpdateCategoriesDto,
  ResponseToClient,
} from './dto/categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post('create')
  async createCategory(
    @Body() data: CreateCategoriesDto,
  ): Promise<ResponseToClient> {
    try {
      await this.categoriesService.create(data);
      return {
        status_code: HttpStatus.OK,
        message: 'Category created successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('category/:id')
  async getCategoryById(@Param('id') id: number): Promise<ResponseToClient> {
    try {
      const category = await this.categoriesService.getById(id);
      if (!category) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Category is not exist!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Category fetched successfully!',
        data: [category],
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('user/:id')
  async getCategoriesByUserId(
    @Param('id') id: string,
  ): Promise<ResponseToClient> {
    try {
      const categories = await this.categoriesService.getAllByUserId(id);
      if (!categories) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No founded categories!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Categories fetched successfully!',
        data: categories,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('title/:title')
  async getCategoriesByTitle(
    @Param('title') title: string,
  ): Promise<ResponseToClient> {
    try {
      const categories = await this.categoriesService.getAllByTitle(title);
      if (!categories) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No founded categories!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Categories fetched successfully!',
        data: categories,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('all')
  async getAllCategories(): Promise<ResponseToClient> {
    try {
      const categories = await this.categoriesService.getAll();
      if (!categories) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No founded categories!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Categories fetched successfully!',
        data: categories,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Patch('category/:id')
  async updateCategory(
    @Param('id') id: number,
    @Body() data: UpdateCategoriesDto,
  ): Promise<ResponseToClient> {
    try {
      const category = await this.categoriesService.getById(id);
      if (!category) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Category is not exist!',
        };
      }
      await this.categoriesService.update(id, data);
      return {
        status_code: HttpStatus.OK,
        message: 'Category updated successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Delete('category/:id')
  async deleteCategory(@Param('id') id: number): Promise<ResponseToClient> {
    try {
      const category = await this.categoriesService.getById(id);
      if (!category) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Category is not exist!',
        };
      }
      await this.categoriesService.remove(id);
      return {
        status_code: HttpStatus.OK,
        message: 'Category deleted successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }
}
