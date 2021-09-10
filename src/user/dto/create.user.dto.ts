import { IsEmail, IsMobilePhone, IsString, MaxLength } from 'class-validator';

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

  constructor(
    first_name: string,
    last_name: string,
    mobile: string,
    email: string,
    password: string,
  ) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.mobile = mobile;
    this.email = email;
    this.password = password;
  }
}
