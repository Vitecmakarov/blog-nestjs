import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from '../post/posts.module';
import { UsersModule } from '../user/users.module';

import { PostsCommentsEntity } from './entity/post_comments.entity';
import { PostCommentsService } from './service/post-comments.service';
import { PostCommentsController } from './controller/post-comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostsCommentsEntity]), PostsModule, UsersModule],
  providers: [PostCommentsService],
  controllers: [PostCommentsController],
  exports: [PostCommentsService],
})
export class CommentsModule {}
