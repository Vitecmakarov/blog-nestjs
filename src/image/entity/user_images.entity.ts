import { Entity, OneToOne, JoinColumn } from 'typeorm';
import { BaseImagesEntity } from './base_images.entity';
import { UsersEntity } from '../../user/entity/users.entity';

@Entity('users_images')
export class UsersImagesEntity extends BaseImagesEntity {
  @OneToOne(() => UsersEntity, (user) => user.avatar, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;
}
