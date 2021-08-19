import { IsString, MaxLength, IsMimeType, IsNumber } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @MaxLength(100)
  filename: string;

  @IsString()
  data: string;

  @IsString()
  @IsMimeType()
  type: string;
}

export class AddImageAction {
  @IsNumber()
  type: ImageAction.ADD;

  data: CreateImageDto;
}

export class DeleteImageAction {
  @IsNumber()
  type: ImageAction.DELETE;

  @IsString()
  id: string;
}

export enum ImageAction {
  ADD,
  DELETE,
}
