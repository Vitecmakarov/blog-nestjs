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

import { PostCommentsService } from './post-comments.service';

import {
  CreatePostCommentDto,
  UpdatePostComment,
  ResponseToClient,
} from './dto/post-comments.dto';

@Controller('comments')
export class PostCommentsController {
  constructor(private postCommentsService: PostCommentsService) {}

  @Post('create')
  async createComment(
    @Body() data: CreatePostCommentDto,
  ): Promise<ResponseToClient> {
    try {
      await this.postCommentsService.create(data);
      return {
        status_code: HttpStatus.OK,
        message: 'Comment created successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('comment/:id')
  async getCommentById(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const comment = await this.postCommentsService.getById(id);
      if (!comment) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Comment is not exist!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Comment fetched successfully!',
        data: [comment],
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('user/:id')
  async getCommentsByUserId(
    @Param('id') id: string,
  ): Promise<ResponseToClient> {
    try {
      const comments = await this.postCommentsService.getAllByUserId(id);
      if (!comments) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No comments!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Comments fetched successfully!',
        data: comments,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('post/:id')
  async getAllCommentsByPostId(
    @Param('id') id: string,
  ): Promise<ResponseToClient> {
    try {
      const comments = await this.postCommentsService.getAllByPostId(id);
      if (!comments) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No comments!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Comments fetched successfully!',
        data: comments,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('all')
  async getAllComments(): Promise<ResponseToClient> {
    try {
      const comments = await this.postCommentsService.getAll();
      if (!comments) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No comments!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Comments fetched successfully!',
        data: comments,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Patch('comment/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() data: UpdatePostComment,
  ): Promise<ResponseToClient> {
    try {
      const comment = await this.postCommentsService.getById(id);
      if (!comment) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Comment is not exist!',
        };
      }
      await this.postCommentsService.update(id, data);
      return {
        status_code: HttpStatus.OK,
        message: 'Comment updated successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Delete('comment/:id')
  async deletePost(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const comment = await this.postCommentsService.getById(id);
      if (!comment) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Comment is not exist!',
        };
      }
      await this.postCommentsService.remove(id);
      return {
        status_code: HttpStatus.OK,
        message: 'Comment deleted successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }
}
