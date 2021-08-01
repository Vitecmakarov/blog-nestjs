import { IsString, IsUUID } from 'class-validator';

export class PostDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  attachments?: Buffer;

  @IsString()
  content: string;
}
