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
import { CategoriesDto, ResponseToClient } from './dto/categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post('create')
  async createCategory(@Body() data: CategoriesDto): Promise<ResponseToClient> {
    try {
      await this.categoriesService.create(data);
      return {
        status_code: HttpStatus.OK,
        message: 'Post category created successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('category/:id')
  async getCategoryById(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const category = await this.categoriesService.getById(id);
      if (!category) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post category is not exist!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Post category fetched successfully!',
        data: [category],
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('category/title/:title')
  async getCategoriesByTitle(
    @Param('title') title: string,
  ): Promise<ResponseToClient> {
    try {
      const category = await this.categoriesService.getByTitle(title);
      if (!category) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No founded categories!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Post categories fetched successfully!',
        data: category,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('all')
  async getAllPosts(): Promise<ResponseToClient> {
    try {
      const post = await this.categoriesService.getAll();
      if (!post) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No founded categories!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Categories fetched successfully!',
        data: post,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Patch('category/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() data: CategoriesDto,
  ): Promise<ResponseToClient> {
    try {
      const post = await this.categoriesService.getById(id);
      if (!post) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post category is not exist!',
        };
      }
      await this.categoriesService.update(id, data);
      return {
        status_code: HttpStatus.OK,
        message: 'Post category updated successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Delete('category/:id')
  async deletePost(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const post = await this.categoriesService.getById(id);
      if (!post) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post category is not exist!',
        };
      }
      await this.categoriesService.remove(id);
      return {
        status_code: HttpStatus.OK,
        message: 'Post category deleted successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }
}
