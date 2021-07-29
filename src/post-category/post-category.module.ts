import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCategoryService } from './post-category.service';
import { PostCategoryController } from './post-category.controller';
import { PostCategoryEntity } from './post-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostCategoryEntity])],
  providers: [PostCategoryService],
  controllers: [PostCategoryController],
})
export class PostCategoryModule {}
