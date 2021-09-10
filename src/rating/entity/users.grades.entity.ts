import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseGradesEntity } from './base.grades.entity';
import { UsersEntity } from '../../user/entity/users.entity';

@Entity('users_grades')
export class UsersGradesEntity extends BaseGradesEntity {
  @ManyToOne(() => UsersEntity, (user) => user.users_grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'estimator_id', referencedColumnName: 'id' })
  estimator: UsersEntity;

  @ManyToOne(() => UsersEntity, (user) => user.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluated_id', referencedColumnName: 'id' })
  evaluated: UsersEntity;
}
