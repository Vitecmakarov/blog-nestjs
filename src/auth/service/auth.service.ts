import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  NotAcceptableException,
} from '@nestjs/common';
import { compare } from 'bcrypt';

import { RATING_AVAILABLE_FOR_LOGIN, MINIMUM_GRADES_TO_VALIDATE } from '../constants/constants';

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

    if (
      user.grades.length > MINIMUM_GRADES_TO_VALIDATE &&
      user.rating < RATING_AVAILABLE_FOR_LOGIN
    ) {
      throw new NotAcceptableException('User rating is too low, account is not available');
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
