import { promisify } from 'util';
import { readFile } from 'fs';
import { basename } from 'path';
import { lookup } from 'mime-types';

import { CreateImageDto } from '../../../src/image/dto/create.image.dto';

export class ImageTestDto {
  async create(): Promise<CreateImageDto> {
    const read = promisify(readFile);
    const pathToTestFile = `${__dirname}/../test_image.png`;
    const image_data = await read(pathToTestFile, { encoding: 'base64' });
    return {
      filename: basename(pathToTestFile),
      type: lookup(pathToTestFile) as string,
      data: image_data,
    };
  }
}
