import { ArrayMinSize, IsArray, IsString, IsUUID, MaxLength, IsOptional } from 'class-validator';

import { CreateImageDto } from '../../image/dto/images.dto';
import { UpdateCategoryAction } from '../../category/dto/categories.dto';

export class CreatePostDto {
  @IsString()
  @IsUUID(4)
  user_id: string;

  @IsArray()
  @ArrayMinSize(1)
  category_ids: string[];

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  image?: CreateImageDto;

  constructor(user_id: string, category_ids: string[], title: string, content: string, image?: CreateImageDto) {
    this.user_id = user_id;
    this.category_ids = category_ids;
    this.title = title;
    this.content = content;
    this.image = image;
  }
}

export class UpdatePostDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  category_actions?: UpdateCategoryAction[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  image?: CreateImageDto;

  constructor(category_actions?: UpdateCategoryAction[], title?: string, content?: string, image?: CreateImageDto) {
    this.category_actions = category_actions;
    this.title = title;
    this.content = content;
    this.image = image;
  }
}
