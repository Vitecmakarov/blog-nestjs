import { IsString, MaxLength } from 'class-validator';
import { CategoriesEntity } from '../categories.entity';

export class CategoriesDto {
  @IsString()
  @MaxLength(100)
  title: string;
}

export interface ResponseToClient {
  status_code: number;
  message: string;
  data?: CategoriesEntity[];
}
