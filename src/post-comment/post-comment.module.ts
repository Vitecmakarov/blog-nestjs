import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCommentController } from './post-comment.controller';
import { PostCommentService } from './post-comment.service';
import { PostCommentEntity } from './post-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostCommentEntity])],
  controllers: [PostCommentController],
  providers: [PostCommentService],
})
export class PostCommentModule {}
