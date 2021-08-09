import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { CreateImageDto, UpdateImageDto } from '../../image/dto/images.dto';

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

  @IsArray()
  images?: Array<CreateImageDto>;
}

export class UpdatePostDto {
  @IsArray()
  category_actions?: Array<UpdateCategoryAction>;

  @IsString()
  @MaxLength(100)
  title?: string;

  @IsString()
  content?: string;

  @IsArray()
  image_actions?: Array<UpdateImageDto>;
}

export interface UpdateCategoryAction {
  type: CategoryAction;
  category_id: string;
}

export enum CategoryAction {
  ADD,
  DELETE,
}
