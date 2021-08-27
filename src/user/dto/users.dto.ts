import { IsString, IsMobilePhone, IsEmail, MaxLength, IsOptional } from 'class-validator';

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

  constructor(first_name: string, last_name: string, mobile: string, email: string, password: string) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.mobile = mobile;
    this.email = email;
    this.password = password;
  }
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

  constructor(first_name?: string, last_name?: string, profile_desc?: string, avatar?: CreateImageDto) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.profile_desc = profile_desc;
    this.avatar = avatar;
  }
}

export class UpdateUserPasswordDto {
  @IsString()
  password: string;

  constructor(password: string) {
    this.password = password;
  }
}
