import { BaseEntity, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('users_grades')
export class UsersGradesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.users_rates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'estimator_id', referencedColumnName: 'id' })
  estimator: UsersEntity;

  @ManyToOne(() => UsersEntity, (user) => user.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluated_user_id', referencedColumnName: 'id' })
  evaluated_user: UsersEntity;

  @Column({ type: 'int', nullable: false, width: 1 })
  grade: number;
}
