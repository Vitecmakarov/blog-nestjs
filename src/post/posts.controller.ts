import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import {
  CreatePostDto,
  ResponseToClient,
  UpdatePostDto,
} from './dto/posts.dto';
import { PostsEntity } from './posts.entity';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
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

  @Get('/all')
  async getAllPosts(): Promise<PostsEntity[]> {
    const posts = await this.postsService.getAll();
    // if (!posts) {
    //   return {
    //     status_code: HttpStatus.NOT_FOUND,
    //     message: 'No posts!',
    //   };
    // }
    // т.к. posts это массив, он всегда будет truthy даже если пустой. можно проверить !posts.length.
    // но обычно просто возвращается пустой массив и это не является ошибкой
    return posts;
  }

  // TODO:
  // patch c джсоном { "content": "lorem ipsum dolor sit amet" }
  // возвращает ошибки валидации
  @Patch('post/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() data: UpdatePostDto,
  ): Promise<PostsEntity> {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    //TODO: проверить чтоб нельзя было менять user_id у поста
    return await this.postsService.update(id, data);
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
