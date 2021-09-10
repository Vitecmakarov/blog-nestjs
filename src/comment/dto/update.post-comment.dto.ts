import { IsString } from 'class-validator';

export class UpdatePostCommentDto {
  @IsString()
  content: string;

  constructor(content: string) {
    this.content = content;
  }
}
