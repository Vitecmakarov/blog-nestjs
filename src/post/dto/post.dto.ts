import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PostEntity } from '../post.entity';

export class CreatePostDto {
  @IsString()
  @IsUUID()
  user_id: string;

  @IsArray()
  @ArrayMinSize(1)
  category_id: Array<string>;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  content: string;

  @IsString()
  attachments?: string;
}

export class UpdatePostDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  category_action?: Array<categoryAction>;

  @IsString()
  @MaxLength(100)
  title?: string;

  @IsString()
  content?: string;

  @IsString()
  attachments?: string;
}

export interface ResponseToClient {
  status_code: number;
  message: string;
  data?: PostEntity[];
}

export interface categoryAction {
  type: Action;
  id: string;
}

export enum Action {
  ADD,
  DELETE,
}
