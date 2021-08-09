import { IsNumber, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  filename: string;

  @IsNumber()
  size: number;

  @IsString()
  data: string;

  @IsString()
  mimetype: string;
}

export class UpdateImageDto {
  @IsNumber()
  action: Action;

  @IsString()
  data: CreateImageDto | string;
}

export enum Action {
  ADD,
  DELETE,
}
