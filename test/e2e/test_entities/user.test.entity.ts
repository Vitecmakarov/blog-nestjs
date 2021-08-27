import { UsersEntity } from '../../../src/user/users.entity';
import { UsersService } from '../../../src/user/users.service';

export class UserTestEntity {
  constructor(private readonly usersService: UsersService) {}
  async create(): Promise<UsersEntity> {
    return await this.usersService.create({
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      password: 'password_test',
    });
  }
}
