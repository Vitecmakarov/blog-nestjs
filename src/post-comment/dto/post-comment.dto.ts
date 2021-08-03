import { IsString, IsUUID } from 'class-validator';

export class CreatePostCommentDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  postId: string;

  @IsString()
  content: string;

  @IsString()
  attachments?: string;
}
