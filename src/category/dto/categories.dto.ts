import { IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateCategoriesDto {
  @IsString()
  @IsUUID(4)
  user_id: string;

  @IsString()
  @MaxLength(100)
  title: string;

  constructor(user_id: string, title: string) {
    this.user_id = user_id;
    this.title = title;
  }
}

export class UpdateCategoriesDto {
  @IsString()
  @MaxLength(100)
  title: string;

  constructor(title: string) {
    this.title = title;
  }
}

export class UpdateCategoryAction {
  type: CategoryAction;

  @IsString()
  @IsUUID(4)
  category_id: string;

  constructor(type: number, category_id: string) {
    this.type = type;
    this.category_id = category_id;
  }
}

export enum CategoryAction {
  ADD,
  DELETE,
}
