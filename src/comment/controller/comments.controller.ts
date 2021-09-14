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
import { Public } from '../../decorators/jwt.decorator';

import { CreateCommentDto } from '../dto/create.coment.dto';
import { UpdateCommentDto } from '../dto/update.comment.dto';
import { UpdateCommentGradesDto } from '../dto/update.comment.grades.dto';

import { CommentsEntity } from '../entity/comments.entity';
import { CommentsService } from '../service/comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private postCommentsService: CommentsService) {}

  @Post('create')
  async createComment(@Body() data: CreateCommentDto): Promise<void> {
    await this.postCommentsService.create(data);
  }

  @Post(':id/grades')
  async addGradeToComment(
    @Param('id') id: string,
    @Body() data: UpdateCommentGradesDto,
  ): Promise<void> {
    const comment = await this.postCommentsService.getById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.postCommentsService.updateRating(id, data);
  }

  @Public()
  @Get('post/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCommentsByPostId(@Param('id') id: string): Promise<CommentsEntity[]> {
    return await this.postCommentsService.getAllByPostId(id);
  }

  @Patch(':id')
  async updateComment(@Param('id') id: string, @Body() data: UpdateCommentDto): Promise<void> {
    const comment = await this.postCommentsService.getById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.postCommentsService.update(id, data);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<void> {
    const comment = await this.postCommentsService.getById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.postCommentsService.remove(id);
  }
}
