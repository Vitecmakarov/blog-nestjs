import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsImagesEntity } from './entity/post_images.entity';
import { UsersImagesEntity } from './entity/user_images.entity';

import { UserImagesService } from './service/user_images.service';
import { PostImagesService } from './service/post_images.service';

import { ImagesController } from './controller/images.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostsImagesEntity, UsersImagesEntity])],
  providers: [PostImagesService, UserImagesService],
  controllers: [ImagesController],
  exports: [PostImagesService, UserImagesService],
})
export class ImagesModule {}
