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
  StreamableFile,
} from '@nestjs/common';
import { Public } from '../../decorators/jwt.decorator';

import { createReadStream } from 'fs';

import { CreatePostDto } from '../dto/create.post.dto';
import { UpdatePostDto } from '../dto/update.post.dto';
import { UpdatePostGradesDto } from '../dto/update.post.grades.dto';

import { PostsEntity } from '../entity/posts.entity';
import { PostsService } from '../service/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  async createPost(@Body() data: CreatePostDto): Promise<void> {
    await this.postsService.create(data);
  }

  @Post(':id/grades')
  async addGradeToPost(@Param('id') id: string, @Body() data: UpdatePostGradesDto): Promise<void> {
    const user = await this.postsService.getById(id);
    if (!user) {
      throw new NotFoundException('Post not found');
    }
    await this.postsService.updateRating(id, data);
  }

  @Public()
  @Get('all')
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllPosts(): Promise<PostsEntity[]> {
    return await this.postsService.getAll();
  }

  @Public()
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getPostById(@Param('id') id: string): Promise<PostsEntity> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @Public()
  @Get(':id/image')
  async getPostImage(@Param('id') id: string): Promise<StreamableFile> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (!post.image) {
      throw new NotFoundException('Image not found');
    }
    const file = createReadStream(post.image.path);
    return new StreamableFile(file);
  }

  @Public()
  @Get('category/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getPostsByCategoryId(@Param('id') id: string): Promise<PostsEntity[]> {
    return await this.postsService.getAllByCategoryId(id);
  }

  @Patch(':id')
  async updatePost(@Param('id') id: string, @Body() data: UpdatePostDto): Promise<void> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postsService.update(id, data);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<void> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postsService.remove(id);
  }
}
