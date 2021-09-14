import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseInterceptors,
  NotFoundException,
  ClassSerializerInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Public } from '../../decorators/jwt.decorator';

import { createReadStream } from 'fs';

import { CreateUserDto } from '../dto/create.user.dto';
import { UpdateUserDto } from '../dto/update.user.dto';
import { UpdatePasswordDto } from '../dto/update.password.dto';
import { UpdateUserGradesDto } from '../dto/update.user.grades.dto';

import { UsersEntity } from '../entity/users.entity';
import { UsersService } from '../service/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Public()
  @Post('register')
  async registerUser(@Body() data: CreateUserDto): Promise<void> {
    await this.usersService.create(data);
  }

  @Post(':id/grades')
  async addGradeToUser(@Param('id') id: string, @Body() data: UpdateUserGradesDto): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.updateRating(id, data);
  }

  @Public()
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUser(@Param('id') id: string): Promise<UsersEntity> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Public()
  @Get(':id/avatar')
  async getUserAvatar(@Param('id') id: string): Promise<StreamableFile> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.avatar) {
      throw new NotFoundException('Avatar not found');
    }
    const file = createReadStream(user.avatar.path);
    return new StreamableFile(file);
  }

  @Patch(':id/profile')
  async updateUserProfile(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.update(id, data);
  }

  @Patch(':id/password')
  async updateUserPassword(
    @Param('id') id: string,
    @Body() data: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.updatePassword(id, data);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.remove(id);
  }
}
