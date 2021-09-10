import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Public } from '../../decorators/jwt.decorator';

import { GeneratedAccessToken } from '../dto/access.token.dto';

import { AuthService } from '../service/auth.service';
import { UsersService } from '../../user/service/users.service';

import { ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}
  @Public()
  @UseGuards(ThrottlerGuard)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<GeneratedAccessToken> {
    return this.authService.login(req.user);
  }
}
