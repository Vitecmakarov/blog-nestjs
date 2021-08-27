import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../category/categories.module';
import { UsersModule } from '../user/users.module';
import { ImagesModule } from '../image/images.module';

import { PostsEntity } from './posts.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity]), CategoriesModule, UsersModule, ImagesModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
