import { IsString, IsUUID, IsEmail, IsJWT } from 'class-validator';

export class LocalAuthResponse {
  @IsString()
  @IsUUID(4)
  id: string;

  @IsString()
  @IsEmail()
  email: string;
}

export class GeneratedAccessToken {
  @IsString()
  @IsJWT()
  access_token: string;
}

export class JwtPayload {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsUUID(4)
  sub: string;
}
