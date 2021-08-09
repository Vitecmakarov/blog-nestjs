import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { createHash } from 'crypto';
import { extension } from 'mime-types';
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
    // size можно вычислять на основании размера data
    const { filename, size, data, mimetype } = imageData;

    const b64Data = data.replace(/^data:image\/\w+;base64,/, '');

    const fileExtension = extension(mimetype) as string;

    const fileNameToSave = await ImagesService._createImageName(filename);

    const fileDirToSave = await this._createImageDirIfNotExist(fileNameToSave);

    const pathToFile = `${IMAGES_DIR}/${fileDirToSave}/${fileNameToSave}.${fileExtension}`;

    // мы должны подождать пока файл запишется и только в случае успеха делать запись в БД.
    writeFile(pathToFile, b64Data, { encoding: 'base64' }, (err) => {
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
    // unlink должен быть в промисе
    // например так: https://nodejs.org/dist/latest-v8.x/docs/api/util.html#util_util_promisify_original
    unlink(image.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('File removed');
    });
    await this.imagesRepository.delete(id);
  }

  private async _createImageDirIfNotExist(filename: string): Promise<string> {
    const fileDir = `${IMAGES_DIR}/${filename.slice(0, 2)}`;
    // access и mkdir нужно завернуть в Promise
    access(fileDir, function (err) {
      if (err && err.code === 'ENOENT') {
        mkdir(fileDir, () => {
          console.log('Directory created');
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
