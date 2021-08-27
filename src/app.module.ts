import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/users.module';
import { PostsModule } from './post/posts.module';
import { CategoriesModule } from './category/categories.module';
import { CommentsModule } from './comment/comments.module';
import { ImagesModule } from './image/images.module';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule, PostsModule, CategoriesModule, CommentsModule, ImagesModule],
})
export class AppModule {}
