import { IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateCategoriesDto {
  @IsString()
  @IsUUID(4)
  user_id: string;

  @IsString()
  @MaxLength(100)
  title: string;
}

export class UpdateCategoriesDto {
  @IsString()
  @MaxLength(100)
  title: string;
}

export class UpdateCategoryAction {
  type: CategoryAction;

  @IsString()
  @IsUUID(4)
  category_id: string;
}

export enum CategoryAction {
  ADD,
  DELETE,
}
