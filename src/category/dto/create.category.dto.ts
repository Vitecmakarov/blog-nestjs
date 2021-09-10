import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCategoryDto {
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
