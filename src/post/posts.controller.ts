import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/posts.dto';
import { PostsEntity } from './posts.entity';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('create')
  async createPost(@Body() data: CreatePostDto): Promise<void> {
    await this.postsService.create(data);
  }

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostsEntity> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @Get('category/:id')
  async getPostsByCategoryId(@Param('id') id: string): Promise<PostsEntity[]> {
    return await this.postsService.getAllByCategoryId(id);
  }

  @Get('user/:id')
  async getPostsByUserId(@Param('id') id: string): Promise<PostsEntity[]> {
    return await this.postsService.getAllByUserId(id);
  }

  @Get('all')
  async getAllPosts(): Promise<PostsEntity[]> {
    return await this.postsService.getAll();
  }

  @Patch('post/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() data: UpdatePostDto,
  ): Promise<void> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postsService.update(id, data);
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<void> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postsService.remove(id);
  }
}
