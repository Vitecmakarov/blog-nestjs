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

import { CreatePostCommentDto, UpdatePostCommentDto } from './dto/comments.dto';
import { CommentsEntity } from './comments.entity';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private postCommentsService: CommentsService) {}

  @Get('comment/:id')
  async getCommentById(@Param('id') id: string): Promise<CommentsEntity> {
    const comment = await this.postCommentsService.getById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  @Get('user/:id')
  async getCommentsByUserId(
    @Param('id') id: string,
  ): Promise<CommentsEntity[]> {
    return await this.postCommentsService.getAllByUserId(id);
  }

  @Get('post/:id')
  async getAllCommentsByPostId(
    @Param('id') id: string,
  ): Promise<CommentsEntity[]> {
    return await this.postCommentsService.getAllByPostId(id);
  }

  @Post('create')
  async createComment(@Body() data: CreatePostCommentDto): Promise<void> {
    await this.postCommentsService.create(data);
  }

  @Patch('comment/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() data: UpdatePostCommentDto,
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
