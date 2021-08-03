import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/users.module';
import { PostsModule } from './post/posts.module';
import { CategoriesModule } from './category/categories.module';
import { PostCommentModule } from './post-comment/post-comment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UsersModule,
    PostsModule,
    CategoriesModule,
    PostCommentModule,
  ],
})
export class AppModule {}
