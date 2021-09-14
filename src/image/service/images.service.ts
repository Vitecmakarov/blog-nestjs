import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { config } from 'dotenv';
import { createHash } from 'crypto';
import { promisify } from 'util';
import { extension as mimeToExtension } from 'mime-types';
import { writeFile, existsSync, mkdirSync, access, mkdir, unlink } from 'fs';

import { CreateImageDto } from '../dto/create.image.dto';
import { ImagesEntity } from '../entity/images.entity';

config({ path: `./env/.env.${process.env.NODE_ENV}` });
const imagesDir = process.env.PWD + process.env.IMAGES_DIR;

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

    const fileName = ImagesService._createImageName(filename);
    const fileDir = await ImagesService._createImageDirIfNotExist(fileName);

    const path = `${fileDir}/${fileName}.${extension}`;
    const write = promisify(writeFile);
    await write(path, buff);

    const image = await this.imagesRepository.create({
      path: path,
      size: size,
      extension: extension,
    });

    await this.imagesRepository.save(image);
    return image;
  }

  async remove(id: string): Promise<void> {
    const image = await this.imagesRepository.findOne(id);
    await this.imagesRepository.delete(id);

    const checkIfFileExist = promisify(access);
    const unlinkFile = promisify(unlink);

    try {
      await checkIfFileExist(image.path);
    } catch (err) {
      return;
    }
    await unlinkFile(image.path);
  }

  private static async _createImageDirIfNotExist(filename: string): Promise<string> {
    const fileDir = `${imagesDir}/${filename.slice(0, 2)}`;

    const checkIfDirExist = promisify(access);
    const createDir = promisify(mkdir);

    try {
      await checkIfDirExist(fileDir);
    } catch (err) {
      await createDir(fileDir);
    }
    return fileDir;
  }

  private static _createImageName(name: string): string {
    return createHash('sha256').update(`${name}:${Date.now()}`).digest('hex');
  }
}
