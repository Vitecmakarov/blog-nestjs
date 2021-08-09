import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user/:id')
  async getUserById(@Param('id') id: string): Promise<UsersEntity> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post('register')
  async registerUser(@Body() data: CreateUserDto): Promise<void> {
    await this.usersService.create(data);
  }

  @Patch('user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.update(id, data);
  }

  @Patch('pass/user/:id')
  async updateUserPassword(
    @Param('id') id: string,
    @Body() password: string,
  ): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.updatePassword(id, password);
  }

  @Delete('user/:id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.remove(id);
  }

  // Only for development!
  @Get('all')
  async getAllUsers(): Promise<UsersEntity[]> {
    return await this.usersService.getAll();
  }
}
