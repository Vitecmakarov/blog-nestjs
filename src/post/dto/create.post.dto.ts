import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CreateImageDto } from '../../image/dto/create.image.dto';

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

  constructor(
    user_id: string,
    category_ids: string[],
    title: string,
    content: string,
    image?: CreateImageDto,
  ) {
    this.user_id = user_id;
    this.category_ids = category_ids;
    this.title = title;
    this.content = content;
    this.image = image;
  }
}
