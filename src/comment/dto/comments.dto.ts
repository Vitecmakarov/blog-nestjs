import {
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';

import {
  CreateImageDto,
  AddImageAction,
  DeleteImageAction,
} from '../../image/dto/images.dto';

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
  @ArrayMinSize(1)
  image_actions?: Array<AddImageAction | DeleteImageAction>;
}
