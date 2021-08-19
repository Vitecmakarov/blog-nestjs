import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
  IsOptional,
} from 'class-validator';

import {
  CreateImageDto,
  AddImageAction,
  DeleteImageAction,
} from '../../image/dto/images.dto';
import { UpdateCategoryAction } from '../../category/dto/categories.dto';

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
  @ArrayMinSize(1)
  images?: Array<CreateImageDto>;
}

export class UpdatePostDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
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
  @ArrayMinSize(1)
  image_actions?: Array<AddImageAction | DeleteImageAction>;
}
