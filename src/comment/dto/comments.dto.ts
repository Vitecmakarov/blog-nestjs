import { IsString, IsUUID, IsArray, IsOptional } from 'class-validator';

import { CreateImageDto } from '../../image/dto/images.dto';

export class CreatePostCommentDto {
  @IsString()
  @IsUUID(4)
  user_id: string;

  @IsString()
  @IsUUID(4)
  post_id: string;

  @IsString()
  content: string;

  @IsOptional()
  images?: Array<CreateImageDto>;
}

export class UpdatePostCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  image_actions?: Array<AddImageAction | DeleteImageAction>;
}

interface AddImageAction {
  type: Action.ADD;
  data: CreateImageDto;
}

interface DeleteImageAction {
  type: Action.DELETE;
  id: string;
}

export enum Action {
  ADD,
  DELETE,
}
