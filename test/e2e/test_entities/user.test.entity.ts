import { UsersEntity } from '../../../src/user/entity/users.entity';
import { UsersService } from '../../../src/user/service/users.service';
import { MakeRandomString } from './random.string';

export class UserTestEntity {
  constructor(private readonly usersService: UsersService) {}
  async create(): Promise<UsersEntity> {
    return await this.usersService.create({
      first_name: MakeRandomString(14),
      last_name: MakeRandomString(14),
      mobile: MakeRandomString(14),
      email: MakeRandomString(14),
      password: 'password_test',
    });
  }
}
