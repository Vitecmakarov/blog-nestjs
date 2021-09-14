import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from '../post/posts.module';
import { UsersModule } from '../user/users.module';

import { CommentsEntity } from './entity/comments.entity';
import { CommentsGradesEntity } from './entity/comments.grades.entity';

import { CommentsService } from './service/comments.service';

import { CommentsController } from './controller/comments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsEntity, CommentsGradesEntity]),
    PostsModule,
    UsersModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
