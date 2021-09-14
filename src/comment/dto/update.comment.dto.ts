import { IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  content: string;

  constructor(content: string) {
    this.content = content;
  }
}
