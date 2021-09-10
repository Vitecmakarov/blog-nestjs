import { Controller, Patch, Body, Param } from '@nestjs/common';

import { CreateGradeDto } from '../dto/create.grade.dto';
import { CreateCommentGradeDto } from '../dto/create.comment.grade.dto';

import { UsersGradesService } from '../service/users-grades.service';
import { PostsGradesService } from '../service/posts-grades.service';
import { PostsCommentsGradesService } from '../service/comments-grades.service';

@Controller('rating')
export class RatingController {
  constructor(
    private readonly usersRatingService: UsersGradesService,
    private readonly postsRatingService: PostsGradesService,
    private readonly postsCommentsRatingService: PostsCommentsGradesService,
  ) {}

  @Patch('add/post/:id')
  async addPostGrade(@Param('id') id: string, @Body() data: CreateGradeDto): Promise<void> {
    await this.postsRatingService.add(id, data.estimator, data.grade);
  }

  @Patch('add/user/:id')
  async addUserGrade(@Param('id') id: string, @Body() data: CreateGradeDto): Promise<void> {
    await this.usersRatingService.add(id, data.estimator, data.grade);
  }

  @Patch('add/comment/:id')
  async addCommentGrade(
    @Param('id') id: string,
    @Body() data: CreateCommentGradeDto,
  ): Promise<void> {
    await this.postsCommentsRatingService.add(id, data.estimator, data.grade);
  }
}
