import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../image/images.module';

import { UsersEntity } from './entity/users.entity';
import { UsersGradesEntity } from './entity/users.grades.entity';

import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, UsersGradesEntity]), ImagesModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
