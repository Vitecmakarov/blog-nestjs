import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/users.module';
import { PostsModule } from './post/posts.module';
import { CategoriesModule } from './category/categories.module';
import { PostCommentsModule } from './post-comment/post-comments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UsersModule,
    PostsModule,
    CategoriesModule,
    PostCommentsModule,
  ],
})
export class AppModule {}
