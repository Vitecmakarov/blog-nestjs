import { Controller, Post, Request, Body, UseGuards } from '@nestjs/common';
import { Public } from '../decorators/jwt.decorator';

import { CreateUserDto } from '../user/dto/users.dto';
import { GeneratedAccessToken } from './dto/auth.dto';

import { AuthService } from './auth.service';
import { UsersService } from '../user/users.service';

import { ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('register')
  async registerUser(@Body() data: CreateUserDto): Promise<void> {
    await this.usersService.create(data);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<GeneratedAccessToken> {
    await this.usersService.updateLastLogin(req.user.id, new Date(Date.now()).toString());
    return this.authService.login(req.user);
  }
}
