import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

import { CategoriesEntity } from './categories.entity';
import { UsersEntity } from '../user/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesEntity, UsersEntity])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
