import { IsString, IsUUID } from 'class-validator';

export class PostCommentDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  postId: string;

  attachments: Buffer;

  @IsString()
  content: string;
}
