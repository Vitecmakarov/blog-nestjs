import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PostsEntity } from '../posts.entity';

export class CreatePostDto {
  @IsString()
  @IsUUID(4)
  user_id: string;

  @IsArray()
  @ArrayMinSize(1)
  category_ids: Array<string>;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  content: string;

  @IsString()
  images?: string;
}

export class UpdatePostDto {
  @IsArray()
  @ArrayMinSize(1)
  category_action?: Array<categoryAction>;

  @IsString()
  @MaxLength(100)
  title?: string;

  @IsString()
  content?: string;

  @IsString()
  images?: string;
}

export interface ResponseToClient {
  status_code: number;
  message: string;
  data?: PostsEntity[];
}

export interface categoryAction {
  type: Action;
  category_id: number;
}

export enum Action {
  ADD,
  DELETE,
}
