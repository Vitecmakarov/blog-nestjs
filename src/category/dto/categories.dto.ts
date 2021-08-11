import { IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateCategoriesDto {
  @IsString()
  @IsUUID(4)
  userId: string;

  @IsString()
  @MaxLength(100)
  title: string;
}

export class UpdateCategoriesDto {
  @IsString()
  @MaxLength(100)
  title: string;
}
