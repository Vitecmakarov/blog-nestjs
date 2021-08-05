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

import { PostCommentsService } from './post-comments.service';

import {
  CreatePostCommentDto,
  UpdatePostComment,
} from './dto/post-comments.dto';
import { PostCommentsEntity } from './post-comments.entity';

@Controller('comments')
export class PostCommentsController {
  constructor(private postCommentsService: PostCommentsService) {}

  @Post('create')
  async createComment(@Body() data: CreatePostCommentDto): Promise<void> {
    await this.postCommentsService.create(data);
  }

  @Get('comment/:id')
  async getCommentById(@Param('id') id: string): Promise<PostCommentsEntity> {
    const comment = await this.postCommentsService.getById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  @Get('user/:id')
  async getCommentsByUserId(
    @Param('id') id: string,
  ): Promise<PostCommentsEntity[]> {
    return await this.postCommentsService.getAllByUserId(id);
  }

  @Get('post/:id')
  async getAllCommentsByPostId(
    @Param('id') id: string,
  ): Promise<PostCommentsEntity[]> {
    return await this.postCommentsService.getAllByPostId(id);
  }

  @Get('all')
  async getAllComments(): Promise<PostCommentsEntity[]> {
    return await this.postCommentsService.getAll();
  }

  @Patch('comment/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() data: UpdatePostComment,
  ): Promise<void> {
    const comment = await this.postCommentsService.getById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.postCommentsService.update(id, data);
  }

  @Delete('comment/:id')
  async deletePost(@Param('id') id: string): Promise<void> {
    const comment = await this.postCommentsService.getById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.postCommentsService.remove(id);
  }
}
