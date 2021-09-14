import { IsString, IsUUID } from 'class-validator';
import { PostCategoryAction } from '../enums/posts.enums';

export class UpdatePostCategoryAction {
  type: PostCategoryAction;

  @IsString()
  @IsUUID(4)
  category_id: string;

  constructor(type: number, category_id: string) {
    this.type = type;
    this.category_id = category_id;
  }
}
