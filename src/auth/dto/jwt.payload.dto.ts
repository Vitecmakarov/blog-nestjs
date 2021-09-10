import { IsEmail, IsString, IsUUID } from 'class-validator';

export class JwtPayload {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsUUID(4)
  sub: string;
}
