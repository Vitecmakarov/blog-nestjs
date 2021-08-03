import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';

import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ResponseToClient,
} from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async registerUser(@Body() data: CreateUserDto): Promise<ResponseToClient> {
    try {
      await this.usersService.create(data);
      return {
        status_code: HttpStatus.OK,
        message: 'Registration process succeed!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Patch('user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<ResponseToClient> {
    try {
      const user = await this.usersService.getById(id);
      if (!user) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'User is not exist!',
        };
      }
      await this.usersService.update(id, data);
      return {
        status_code: HttpStatus.OK,
        message: 'User updated successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Patch('pass/change/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() password: string,
  ): Promise<ResponseToClient> {
    try {
      const user = await this.usersService.getById(id);
      if (!user) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'User is not exist!',
        };
      }
      await this.usersService.updatePassword(id, password);
      return {
        status_code: HttpStatus.OK,
        message: 'User password updated successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Get('user/:id')
  async getUserById(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const user = await this.usersService.getById(id);
      if (!user) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'User is not exist!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'User fetched successfully!',
        data: [user],
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  @Delete('user/:id')
  async deleteUser(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const user = await this.usersService.getById(id);
      if (!user) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'User is not exist!',
        };
      }
      await this.usersService.remove(id);
      return {
        status_code: HttpStatus.OK,
        message: 'User deleted successfully!',
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }

  // Only for development!
  @Get('all')
  async getAllUsers(): Promise<ResponseToClient> {
    try {
      const user = await this.usersService.getAll();
      if (user.length === 0) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'No founded users!',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Users fetched successfully!',
        data: user,
      };
    } catch (e) {
      return {
        status_code: e.code,
        message: e.message,
      };
    }
  }
}
