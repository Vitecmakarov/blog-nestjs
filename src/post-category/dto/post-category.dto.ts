import { IsString, IsUUID } from 'class-validator';

export class PostCategoryDto {
  @IsString()
  @IsUUID()
  postId: string;

  @IsString()
  @IsUUID()
  categoryId: string;
}
