import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CategoryModule } from './category/category.module';
import { PostCommentModule } from './post-comment/post-comment.module';
import { PostCategoryModule } from './post-category/post-category.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    PostModule,
    CategoryModule,
    PostCommentModule,
    PostCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
