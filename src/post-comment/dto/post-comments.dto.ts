import { IsString, IsUUID } from 'class-validator';
import { PostCommentsEntity } from '../post-comments.entity';

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

export interface ResponseToClient {
  status_code: number;
  message: string;
  data?: PostCommentsEntity[];
}
