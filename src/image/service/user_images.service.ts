import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateImageDto } from '../dto/create.image.dto';
import { UsersImagesEntity } from '../entity/user_images.entity';
import { BaseImagesService } from './base_images.service';

@Injectable()
export class UserImagesService extends BaseImagesService {
  constructor(
    @InjectRepository(UsersImagesEntity)
    private readonly usersImagesRepository: Repository<UsersImagesEntity>,
  ) {
    super();
  }

  async create(dataDto: CreateImageDto): Promise<UsersImagesEntity> {
    const imageDataToSave = await this.saveToFs(dataDto);
    const userImageEntity = this.usersImagesRepository.create(imageDataToSave);
    await this.usersImagesRepository.save(userImageEntity);
    return userImageEntity;
  }

  async getById(id: string): Promise<UsersImagesEntity> {
    return await this.usersImagesRepository.findOne(id, {
      relations: ['user'],
    });
  }

  async getUserId(id: string): Promise<UsersImagesEntity> {
    return await this.usersImagesRepository.findOne(
      { user: { id: id } },
      {
        relations: ['user'],
      },
    );
  }

  async remove(id: string): Promise<void> {
    const image = await this.usersImagesRepository.findOne(id);
    if (!image) {
      throw new NotFoundException('Image with this id is not exist');
    }
    await this.removeFromFs(image.path);
    await this.usersImagesRepository.delete(id);
  }

  // Only for tests
  async getAll(): Promise<UsersImagesEntity[]> {
    return await this.usersImagesRepository.find({
      relations: ['user'],
    });
  }
}
