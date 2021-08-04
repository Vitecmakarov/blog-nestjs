import { IsString, MaxLength, IsUUID } from 'class-validator';
import { CategoriesEntity } from '../categories.entity';

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

export interface ResponseToClient {
  status_code: number;
  message: string;
  data?: CategoriesEntity[];
}
