import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsEntity } from './posts.entity';
import { CategoriesEntity } from '../category/categories.entity';
import { UsersEntity } from '../user/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsEntity, CategoriesEntity, UsersEntity]),
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
