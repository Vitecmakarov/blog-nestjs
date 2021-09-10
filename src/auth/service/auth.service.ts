import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';

import { GeneratedAccessToken } from '../dto/access.token.dto';
import { LocalAuthResponse } from '../dto/local.auth.responce.dto';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../user/service/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(mobile: string, password: string): Promise<LocalAuthResponse> {
    const user = await this.usersService.getByPhoneNumber(mobile);
    if (!user) {
      throw new NotFoundException('User with this phone number does not exist');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(user: LocalAuthResponse): Promise<GeneratedAccessToken> {
    const payload = { email: user.email, sub: user.id };
    await this.usersService.updateLastLogin(user.id, new Date(Date.now()));
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
