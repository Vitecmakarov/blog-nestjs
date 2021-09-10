import { IsString, MaxLength, IsMimeType } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @MaxLength(100)
  filename: string;

  @IsString()
  data: string;

  @IsString()
  @IsMimeType()
  type: string;

  constructor(filename: string, data: string, type: string) {
    this.filename = filename;
    this.data = data;
    this.type = type;
  }
}
