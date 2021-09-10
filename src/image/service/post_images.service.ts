import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateImageDto } from '../dto/create.image.dto';
import { PostsImagesEntity } from '../entity/post_images.entity';
import { BaseImagesService } from './base_images.service';

@Injectable()
export class PostImagesService extends BaseImagesService {
  constructor(
    @InjectRepository(PostsImagesEntity)
    private readonly postsImagesRepository: Repository<PostsImagesEntity>,
  ) {
    super();
  }

  async create(dataDto: CreateImageDto): Promise<PostsImagesEntity> {
    const imageDataToSave = await this.saveToFs(dataDto);
    const postImageEntity = this.postsImagesRepository.create(imageDataToSave);
    await this.postsImagesRepository.save(postImageEntity);
    return postImageEntity;
  }

  async getById(id: string): Promise<PostsImagesEntity> {
    return await this.postsImagesRepository.findOne(id, {
      relations: ['post'],
    });
  }

  async getByPostId(id: string): Promise<PostsImagesEntity> {
    return await this.postsImagesRepository.findOne(
      { post: { id: id } },
      {
        relations: ['post'],
      },
    );
  }

  async remove(id: string): Promise<void> {
    const image = await this.postsImagesRepository.findOne(id);
    if (!image) {
      throw new NotFoundException('Image with this id is not exist');
    }
    await this.removeFromFs(image.path);
    await this.postsImagesRepository.delete(id);
  }

  // Only for tests
  async getAll(): Promise<PostsImagesEntity[]> {
    return await this.postsImagesRepository.find({
      relations: ['post'],
    });
  }
}
