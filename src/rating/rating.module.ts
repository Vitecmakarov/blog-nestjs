import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../user/users.module';
import { PostsModule } from '../post/posts.module';
import { CommentsModule } from '../comment/comments.module';

import { UsersGradesEntity } from './entity/users.grades.entity';
import { PostsGradesEntity } from './entity/posts.grades.entity';
import { PostsCommentsGradesEntity } from './entity/comment.grades.entity';

import { UsersGradesService } from './service/users-grades.service';
import { PostsGradesService } from './service/posts-grades.service';
import { PostsCommentsGradesService } from './service/comments-grades.service';

import { RatingController } from './controller/rating.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersGradesEntity, PostsGradesEntity, PostsCommentsGradesEntity]),
    UsersModule,
    PostsModule,
    CommentsModule,
  ],
  providers: [UsersGradesService, PostsGradesService, PostsCommentsGradesService],
  controllers: [RatingController],
  exports: [UsersGradesService, PostsGradesService, PostsCommentsGradesService],
})
export class RatingModule {}
