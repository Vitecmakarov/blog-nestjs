import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsEntity } from './posts.entity';
import { CategoriesEntity } from '../category/categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity, CategoriesEntity])],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
