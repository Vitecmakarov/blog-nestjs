import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { LocalAuthResponse } from '../dto/auth.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'mobile' });
  }

  async validate(mobile: string, password: string): Promise<LocalAuthResponse> {
    return await this.authService.validateUser(mobile, password);
  }
}
