import { IsEmail, IsString, IsUUID } from 'class-validator';

export class LocalAuthResponse {
  @IsString()
  @IsUUID(4)
  id: string;

  @IsString()
  @IsEmail()
  email: string;
}
