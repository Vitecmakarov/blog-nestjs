import { IsString, MaxLength, IsMimeType } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @MaxLength(100)
  filename: string;

  @IsString()
  data: string;

  @IsString()
  @IsMimeType()
  type: string;
}
