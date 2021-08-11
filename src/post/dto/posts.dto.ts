import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
  IsOptional,
} from 'class-validator';

import { CreateImageDto } from '../../image/dto/images.dto';

export class CreatePostDto {
  @IsString()
  @IsUUID(4)
  user_id: string;

  @IsArray()
  @ArrayMinSize(1)
  category_ids: Array<string>;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  images?: Array<CreateImageDto>;
}

export class UpdatePostDto {
  @IsOptional()
  @IsArray()
  category_actions?: Array<UpdateCategoryAction>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  image_actions?: Array<AddImageAction | DeleteImageAction>;
}

interface UpdateCategoryAction {
  type: Action;
  category_id: string;
}

interface AddImageAction {
  type: Action.ADD;
  data: CreateImageDto;
}

interface DeleteImageAction {
  type: Action.DELETE;
  id: string;
}

export enum Action {
  ADD,
  DELETE,
}
