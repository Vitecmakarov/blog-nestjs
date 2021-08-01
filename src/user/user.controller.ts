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

import { UserService } from './user.service';
import { ResponseToClient } from '../dto/app.dto';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private usersService: UserService) {}

  @Post('register')
  async registerUser(@Body() data: UserDto): Promise<ResponseToClient> {
    try {
      await this.usersService.create(data);
      return {
        statusCode: HttpStatus.OK,
        message: 'Registration process succeed!',
      };
    } catch (e) {
      return {
        statusCode: e.code,
        message: e.message,
      };
    }
  }

  @Patch('changePass/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() password: string,
  ): Promise<ResponseToClient> {
    try {
      const user = await this.usersService.getById(id);
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User is not exist!',
        };
      }
      await this.usersService.updatePassword(id, password);
      return {
        statusCode: HttpStatus.OK,
        message: 'User password updated successfully!',
      };
    } catch (e) {
      return {
        statusCode: e.code,
        message: e.message,
      };
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const user = await this.usersService.getById(id);
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User is not exist',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'User fetched successfully',
        data: user,
      };
    } catch (e) {
      return {
        statusCode: e.code,
        message: e.message,
      };
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<ResponseToClient> {
    try {
      const user = await this.usersService.getById(id);
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User is not exist',
        };
      }
      await this.usersService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'User deleted successfully',
      };
    } catch (e) {
      return {
        statusCode: e.code,
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
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No founded users!',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Users fetched successfully',
        data: user,
      };
    } catch (e) {
      return {
        statusCode: e.code,
        message: e.message,
      };
    }
  }

  // TODO: Think about rigid or flexible structure
  // @Patch(':id')
  // async updateUser(
  //   @Param('id') id: string,
  //   @Body() data: Partial<UserDto>,
  // ): Promise<ResponseToClient> {
  //   try {
  //     const user = await this.usersService.getById(id);
  //     if (!user) {
  //       return {
  //         statusCode: HttpStatus.NOT_FOUND,
  //         message: 'User is not exist',
  //       };
  //     }
  //     await this.usersService.update(id, data);
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'User updated successfully',
  //     };
  //   } catch (e) {
  //     return {
  //       statusCode: e.code,
  //       message: e.message,
  //     };
  //   }
  // }
}
