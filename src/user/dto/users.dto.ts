import {
  IsString,
  IsMobilePhone,
  IsEmail,
  MaxLength,
  IsArray,
} from 'class-validator';

import { UpdateImageDto } from '../../image/dto/images.dto';

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
  @IsString()
  @MaxLength(50)
  first_name?: string;

  @IsString()
  @MaxLength(50)
  last_name?: string;

  @IsString()
  @MaxLength(100)
  profile_desc?: string;

  @IsArray()
  avatar_actions?: Array<UpdateImageDto>;
}
