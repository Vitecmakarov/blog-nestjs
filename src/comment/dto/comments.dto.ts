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

  constructor(user_id: string, post_id: string, content: string) {
    this.user_id = user_id;
    this.post_id = post_id;
    this.content = content;
  }
}

export class UpdatePostCommentDto {
  @IsString()
  content: string;

  constructor(content: string) {
    this.content = content;
  }
}
