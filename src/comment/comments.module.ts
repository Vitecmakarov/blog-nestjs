import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from '../post/posts.module';
import { UsersModule } from '../user/users.module';
import { ImagesModule } from '../image/images.module';

import { CommentsEntity } from './comments.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsEntity]),
    PostsModule,
    UsersModule,
    ImagesModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}