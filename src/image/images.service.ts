import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as dotenv from 'dotenv';
dotenv.config({ path: `./env/.env.${process.env.NODE_ENV}` });

import { createHash } from 'crypto';
import { promisify } from 'util';
import { extension as mimeToExtension } from 'mime-types';
import { writeFile, existsSync, mkdirSync, access, mkdir, unlink } from 'fs';

import { CreateImageDto } from './dto/images.dto';
import { ImagesEntity } from './images.entity';

const imagesDir = process.env.PWD + process.env.IMAGES_DIR;

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImagesEntity)
    private readonly imagesRepository: Repository<ImagesEntity>,
  ) {
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir);
    }
  }

  async create(dataDto: CreateImageDto): Promise<ImagesEntity> {
    const { filename, data, type } = dataDto;

    const buff = Buffer.from(data, 'base64');
    const size = buff.byteLength;

    const extension = mimeToExtension(type) as string;

    const fileName = await ImagesService._createImageName(filename);
    const fileDir = await ImagesService._createImageDirIfNotExist(fileName);

    const path = `${fileDir}/${fileName}.${extension}`;

    const write = promisify(writeFile);

    await write(path, buff);

    const imageData = {
      path: path,
      size: size,
      extension: extension,
    };

    const imageEntity = this.imagesRepository.create(imageData);
    await this.imagesRepository.save(imageEntity);
    return imageEntity;
  }

  async getById(id: string): Promise<ImagesEntity> {
    return await this.imagesRepository.findOne(id, {
      relations: ['user', 'post', 'comment'],
    });
  }

  async getAllByUserId(id: string): Promise<ImagesEntity[]> {
    return await this.imagesRepository.find({
      where: { user: { id: id } },
      relations: ['user'],
    });
  }

  async getAllByPostId(id: string): Promise<ImagesEntity[]> {
    return await this.imagesRepository.find({
      where: { post: { id: id } },
      relations: ['post'],
    });
  }

  async getAllByCommentId(id: string): Promise<ImagesEntity[]> {
    return await this.imagesRepository.find({
      where: { comment: { id: id } },
      relations: ['comment'],
    });
  }

  async remove(id: string): Promise<void> {
    const image = await this.imagesRepository.findOne(id);

    if (!image) {
      throw new NotFoundException('Image with this id is not exist');
    }

    const checkIfFileExist = promisify(access);
    const unlinkFile = promisify(unlink);

    try {
      await checkIfFileExist(image.path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await this.imagesRepository.delete(id);
      }
    }
    await unlinkFile(image.path);
    await this.imagesRepository.delete(id);
  }

  private static async _createImageDirIfNotExist(
    filename: string,
  ): Promise<string> {
    const fileDir = `${imagesDir}/${filename.slice(0, 2)}`;

    const checkIfDirExist = promisify(access);
    const createDir = promisify(mkdir);

    try {
      await checkIfDirExist(fileDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await createDir(fileDir);
      }
    }
    return fileDir;
  }

  private static async _createImageName(name: string): Promise<string> {
    return createHash('sha256').update(`${name}:${Date.now()}`).digest('hex');
  }

  // Only for develop
  async getAll(): Promise<ImagesEntity[]> {
    return await this.imagesRepository.find();
  }
}
