import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { createHash } from 'crypto';
import { extension } from 'mime-types';
import { promisify } from 'util';
import { writeFile, existsSync, mkdirSync, access, mkdir, unlink } from 'fs';

import { CreateImageDto } from './dto/images.dto';
import { IMAGES_DIR } from './constants/images.constants';
import { ImagesEntity } from './images.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImagesEntity)
    private readonly imagesRepository: Repository<ImagesEntity>,
  ) {
    if (!existsSync(IMAGES_DIR)) {
      mkdirSync(IMAGES_DIR);
    }
  }

  async create(imageData: CreateImageDto): Promise<ImagesEntity> {
    const { filename, data, type } = imageData;

    const buff = Buffer.from(data, 'base64');
    const size = buff.byteLength;

    const fileExtension = extension(type) as string;

    const fileNameToSave = await ImagesService._createImageName(filename);
    const fileDirToSave = await this._createImageDirIfNotExist(fileNameToSave);

    const pathToFile = `${IMAGES_DIR}/${fileDirToSave}/${fileNameToSave}.${fileExtension}`;

    const write = promisify(writeFile);

    await write(pathToFile, buff)
      .then(() => {
        console.log(`File ${pathToFile} wrote successfully`);
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    const imageToSave = {
      path: pathToFile,
      size: size,
      extension: fileExtension,
    };

    const image = this.imagesRepository.create(imageToSave);
    await this.imagesRepository.save(image);
    return image;
  }

  async getById(id: string): Promise<ImagesEntity> {
    return await this.imagesRepository.findOne(id, {
      relations: ['user', 'post', 'comment'],
    });
  }

  async getAllByUserId(id: string): Promise<ImagesEntity[]> {
    return await this.imagesRepository.find({
      where: { user: { id: id } },
      relations: ['user', 'post', 'comment'],
    });
  }

  async remove(id: string): Promise<void> {
    const image = await this.imagesRepository.findOne(id);

    const unlinkFile = promisify(unlink);

    await unlinkFile(image.path)
      .then(() => {
        console.log(`Image ${image.path} deleted successfully`);
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    await this.imagesRepository.delete(id);
  }

  private async _createImageDirIfNotExist(filename: string): Promise<string> {
    const fileDir = `${IMAGES_DIR}/${filename.slice(0, 2)}`;

    const checkIfDirExist = promisify(access);
    const createDir = promisify(mkdir);

    await checkIfDirExist(fileDir).catch((err) => {
      if (err.code === 'ENOENT') {
        createDir(fileDir)
          .then(() => {
            console.log('Directory created');
          })
          .catch((err) => {
            throw new Error(err.message);
          });
      }
    });
    return fileDir;
  }

  private static async _createImageName(name: string): Promise<string> {
    return createHash('sha256').update(`${name}:${Date.now()}`).digest('hex');
  }

  // Only for develop
  async getAll(): Promise<ImagesEntity[]> {
    return await this.imagesRepository.find({
      relations: ['user', 'post', 'comment'],
    });
  }
}
