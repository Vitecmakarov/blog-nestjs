import { IsString, IsMobilePhone, IsEmail, MaxLength } from 'class-validator';
import { UsersEntity } from '../users.entity';

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

  @IsString()
  avatar?: string;
}

export interface ResponseToClient {
  status_code: number;
  message: string;
  data?: UsersEntity[];
}
