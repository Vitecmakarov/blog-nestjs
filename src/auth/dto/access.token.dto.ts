import { IsJWT, IsString } from 'class-validator';

export class GeneratedAccessToken {
  @IsString()
  @IsJWT()
  access_token: string;
}
