import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/users.module';
import { PostModule } from './post/post.module';
import { CategoriesModule } from './category/categories.module';
import { PostCommentModule } from './post-comment/post-comment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UsersModule,
    PostModule,
    CategoriesModule,
    PostCommentModule,
  ],
})
export class AppModule {}
