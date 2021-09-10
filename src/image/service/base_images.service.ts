import { config } from 'dotenv';
config({ path: `./env/.env.${process.env.NODE_ENV}` });

import { createHash } from 'crypto';
import { promisify } from 'util';
import { extension as mimeToExtension } from 'mime-types';
import { writeFile, existsSync, mkdirSync, access, mkdir, unlink } from 'fs';

import { CreateImageDto } from '../dto/create.image.dto';
import { ImageDataToSave } from '../interfaces/images.interfaces';

const imagesDir = process.env.PWD + process.env.IMAGES_DIR;

export class BaseImagesService {
  constructor() {
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir);
    }
  }

  async saveToFs(dataDto: CreateImageDto): Promise<ImageDataToSave> {
    const { filename, data, type } = dataDto;

    const buff = Buffer.from(data, 'base64');
    const size = buff.byteLength;
    const extension = mimeToExtension(type) as string;

    const fileName = BaseImagesService._createImageName(filename);
    const fileDir = await BaseImagesService._createImageDirIfNotExist(fileName);

    const path = `${fileDir}/${fileName}.${extension}`;
    const write = promisify(writeFile);
    await write(path, buff);

    return {
      path: path,
      size: size,
      extension: extension,
    };
  }

  async removeFromFs(path: string): Promise<void> {
    const checkIfFileExist = promisify(access);
    const unlinkFile = promisify(unlink);

    try {
      await checkIfFileExist(path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return;
      }
    }
    await unlinkFile(path);
  }

  private static async _createImageDirIfNotExist(filename: string): Promise<string> {
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

  private static _createImageName(name: string): string {
    return createHash('sha256').update(`${name}:${Date.now()}`).digest('hex');
  }
}
