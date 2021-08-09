import { IsString, IsUUID, IsArray } from 'class-validator';

import { CreateImageDto, UpdateImageDto } from '../../image/dto/images.dto';

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
  images?: Array<CreateImageDto>;
}

export class UpdatePostCommentDto {
  @IsString()
  content?: string;

  @IsArray()
  image_actions?: Array<UpdateImageDto>;
}
