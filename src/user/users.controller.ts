import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  NotFoundException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Public } from '../decorators/jwt.decorator';

import { UpdateUserDto, UpdateUserPasswordDto } from './dto/users.dto';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Public()
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUserById(@Param('id') id: string): Promise<UsersEntity> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.update(id, data);
  }

  @Patch(':id/pass/change')
  async updateUserPassword(@Param('id') id: string, @Body() data: UpdateUserPasswordDto): Promise<void> {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.updatePassword(id, data.password);
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
