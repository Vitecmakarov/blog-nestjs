import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
// import { PostModule } from './post/post.module';
// import { CategoryModule } from './category/category.module';
// import { PostCommentModule } from './post-comment/post-comment.module';
// import { PostCategoryModule } from './post-category/post-category.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'nestjs_blog',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    // PostModule,
    // CategoryModule,
    // PostCommentModule,
    // PostCategoryModule,
  ],
})
export class AppModule {}
