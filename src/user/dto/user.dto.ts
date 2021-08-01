import { IsString, IsMobilePhone, IsEmail } from 'class-validator';

export class UserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsMobilePhone()
  mobile: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  profile_desc?: string;

  avatar?: Buffer;
}
