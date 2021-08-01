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

import { PostService } from './post.service';
import { ResponseToClient } from '../dto/app.dto';
import { PostDto } from './dto/post.dto';

@Controller('post')
export class PostController {
  constructor(private postsService: PostService) {}

  @Post('create')
  async createPost(@Body() data: PostDto): Promise<ResponseToClient> {
    try {
      await this.postsService.create(data);
      return {
        statusCode: HttpStatus.OK,
        message: 'Post created successfully',
      };
    } catch (e) {
      return {
        statusCode: e.code,
        message: e.message,
      };
    }
  }

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const post = await this.postsService.getById(id);
      if (!post) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Post is not exist',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Post fetched successfully',
        data: post,
      };
    } catch (e) {
      return {
        statusCode: e.code,
        message: e.message,
      };
    }
  }

  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() data: Partial<PostDto>,
  ): Promise<ResponseToClient> {
    try {
      const post = await this.postsService.getById(id);
      if (!post) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Post is not exist',
        };
      }
      await this.postsService.update(id, data);
      return {
        statusCode: HttpStatus.OK,
        message: 'Post updated successfully',
      };
    } catch (e) {
      return {
        statusCode: e.code,
        message: e.message,
      };
    }
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const post = await this.postsService.getById(id);
      if (!post) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Post is not exist',
        };
      }
      await this.postsService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Post deleted successfully',
      };
    } catch (e) {
      return {
        statusCode: e.code,
        message: e.message,
      };
    }
  }
}
