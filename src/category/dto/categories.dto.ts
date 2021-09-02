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
