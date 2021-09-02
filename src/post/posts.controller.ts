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
import { Public } from '../decorators/jwt.decorator';

import { CreatePostDto, UpdatePostDto } from './dto/posts.dto';
import { PostsEntity } from './posts.entity';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  async createPost(@Body() data: CreatePostDto): Promise<void> {
    await this.postsService.create(data);
  }

  @Public()
  @Get('all')
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllPosts(): Promise<PostsEntity[]> {
    return await this.postsService.getAll();
  }

  @Public()
  @Get('post/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getPostById(@Param('id') id: string): Promise<PostsEntity> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @Public()
  @Get('category/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getPostsByCategoryId(@Param('id') id: string): Promise<PostsEntity[]> {
    return await this.postsService.getAllByCategoryId(id);
  }

  @Patch('post/:id')
  async updatePost(@Param('id') id: string, @Body() data: UpdatePostDto): Promise<void> {
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
