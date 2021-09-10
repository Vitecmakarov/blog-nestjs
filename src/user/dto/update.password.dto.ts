import { IsString, MaxLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MaxLength(50)
  password: string;

  constructor(password: string) {
    this.password = password;
  }
}
