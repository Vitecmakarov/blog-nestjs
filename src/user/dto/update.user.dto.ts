import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateImageDto } from '../../image/dto/create.image.dto';

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

  constructor(
    first_name?: string,
    last_name?: string,
    profile_desc?: string,
    avatar?: CreateImageDto,
  ) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.profile_desc = profile_desc;
    this.avatar = avatar;
  }
}
