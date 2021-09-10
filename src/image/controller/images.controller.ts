import { Controller, Get, Param, NotFoundException, StreamableFile } from '@nestjs/common';
import { Public } from '../../decorators/jwt.decorator';
import { createReadStream } from 'fs';

import { PostImagesService } from '../service/post_images.service';
import { UserImagesService } from '../service/user_images.service';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly postImagesService: PostImagesService,
    private readonly userImagesService: UserImagesService,
  ) {}

  @Public()
  @Get('user/:id')
  async getByUserId(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.userImagesService.getUserId(id);
    if (!image) {
      throw new NotFoundException('Image is not exist');
    }
    const file = createReadStream(image.path);
    return new StreamableFile(file);
  }

  @Public()
  @Get('post/:id')
  async getByPostId(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.postImagesService.getByPostId(id);
    if (!image) {
      throw new NotFoundException('Image is not exist');
    }
    const file = createReadStream(image.path);
    return new StreamableFile(file);
  }
}
