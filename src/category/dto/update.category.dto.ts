import { IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MaxLength(100)
  title: string;

  constructor(title: string) {
    this.title = title;
  }
}
