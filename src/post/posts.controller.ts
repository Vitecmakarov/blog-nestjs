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

import { PostsService } from './posts.service';
import {
  CreatePostDto,
  ResponseToClient,
  UpdatePostDto,
} from './dto/posts.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('create')
  async createPost(@Body() data: CreatePostDto): Promise<ResponseToClient> {
    try {
      await this.postsService.create(data);
      return {
        status_code: HttpStatus.OK,
        message: 'Post created successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const post = await this.postsService.getById(id);
      if (!post) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post is not exist!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Post fetched successfully!',
        data: [post],
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
      const post = await this.postsService.getAll();
      if (!post) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No posts!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Posts fetched successfully!',
        data: post,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Patch('post/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() data: UpdatePostDto,
  ): Promise<ResponseToClient> {
    try {
      const post = await this.postsService.getById(id);
      if (!post) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post is not exist!',
        };
      }
      await this.postsService.update(id, data);
      return {
        status_code: HttpStatus.OK,
        message: 'Post updated successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const post = await this.postsService.getById(id);
      if (!post) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post is not exist!',
        };
      }
      await this.postsService.remove(id);
      return {
        status_code: HttpStatus.OK,
        message: 'Post deleted successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }
}
