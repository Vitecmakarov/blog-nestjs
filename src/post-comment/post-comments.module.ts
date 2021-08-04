import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCommentsController } from './post-comments.controller';
import { PostCommentsService } from './post-comments.service';

import { PostsEntity } from '../post/posts.entity';
import { UsersEntity } from '../user/users.entity';
import { PostCommentsEntity } from './post-comments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostCommentsEntity, PostsEntity, UsersEntity]),
  ],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
