import { IsString, IsUUID } from 'class-validator';

export class CreatePostCommentDto {
  @IsString()
  @IsUUID(4)
  user_id: string;

  @IsString()
  @IsUUID(4)
  post_id: string;

  @IsString()
  content: string;

  @IsString()
  images?: string;
}

export class UpdatePostComment {
  @IsString()
  content?: string;

  @IsString()
  images?: string;
}
