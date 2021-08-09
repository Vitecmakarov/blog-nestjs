import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImagesEntity } from './images.entity';
import { ImagesService } from './images.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImagesEntity])],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
