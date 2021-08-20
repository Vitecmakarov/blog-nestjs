import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreatePostCommentDto {
  @IsString()
  @IsUUID(4)
  user_id: string;

  @IsString()
  @IsUUID(4)
  post_id: string;

  @IsString()
  content: string;
}

export class UpdatePostCommentDto {
  @IsOptional()
  @IsString()
  content: string;
}
