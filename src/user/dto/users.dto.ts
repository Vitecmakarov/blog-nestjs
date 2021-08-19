import {
  IsString,
  IsMobilePhone,
  IsEmail,
  MaxLength,
  IsOptional,
} from 'class-validator';

import { CreateImageDto } from '../../image/dto/images.dto';

export class CreateUserDto {
  @IsString()
  @MaxLength(50)
  first_name: string;

  @IsString()
  @MaxLength(50)
  last_name: string;

  @IsString()
  @IsMobilePhone()
  mobile: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(50)
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  last_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  profile_desc?: string;

  @IsOptional()
  avatar?: CreateImageDto;
}

export class UpdateUserPasswordDto {
  @IsString()
  password: string;
}
