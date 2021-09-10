import { ArrayMinSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

import { CreateImageDto } from '../../image/dto/create.image.dto';
import { UpdatePostCategoryAction } from './update.category.dto';

export class UpdatePostDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  category_actions?: UpdatePostCategoryAction[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  image?: CreateImageDto;

  constructor(
    category_actions?: UpdatePostCategoryAction[],
    title?: string,
    content?: string,
    image?: CreateImageDto,
  ) {
    this.category_actions = category_actions;
    this.title = title;
    this.content = content;
    this.image = image;
  }
}
