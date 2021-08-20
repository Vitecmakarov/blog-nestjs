import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';

import { ImagesService } from './images.service';
import { ImagesEntity } from './images.entity';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('image/data/:id')
  async getCategoryById(@Param('id') id: string): Promise<Buffer> {
    const image_data = await this.imagesService.getFileData(id);
    if (!image_data) {
      throw new InternalServerErrorException('Error while reading file');
    }
    return image_data;
  }

  @Get('user/:id')
  async getAllUserImages(@Param('id') id: string): Promise<ImagesEntity[]> {
    return await this.imagesService.getAllByUserId(id);
  }

  @Get('post/:id')
  async getAllPostImages(@Param('id') id: string): Promise<ImagesEntity[]> {
    return await this.imagesService.getAllByPostId(id);
  }

  @Get('comment/:id')
  async getAllCommentImages(@Param('id') id: string): Promise<ImagesEntity[]> {
    return await this.imagesService.getAllByCommentId(id);
  }
}
