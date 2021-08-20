import {
  Controller,
  Get,
  Param,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';

import { ImagesService } from './images.service';
import { createReadStream } from 'fs';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('image/:id')
  async getById(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.imagesService.getById(id);
    if (!image) {
      throw new NotFoundException('Image is not exist');
    }
    const file = createReadStream(image.path);
    return new StreamableFile(file);
  }

  @Get('user/:id')
  async getByUserId(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.imagesService.getByUserId(id);
    if (!image) {
      throw new NotFoundException('Image is not exist');
    }
    const file = createReadStream(image.path);
    return new StreamableFile(file);
  }

  @Get('post/:id')
  async getPostImage(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.imagesService.getByPostId(id);
    if (!image) {
      throw new NotFoundException('Image is not exist');
    }
    const file = createReadStream(image.path);
    return new StreamableFile(file);
  }
}
