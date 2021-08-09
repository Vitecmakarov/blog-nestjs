import { IsNumber, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  filename: string;

  @IsString()
  data: string;

  @IsString()
  type: string;
}

export class UpdateImageDto {
  @IsNumber()
  action: ImageAction;

  @IsString()
  data: CreateImageDto | string;
}

export enum ImageAction {
  ADD,
  DELETE,
}
