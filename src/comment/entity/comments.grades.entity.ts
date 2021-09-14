import { BaseEntity, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Column } from 'typeorm';

import { CommentsGradesEnum } from '../enums/comments.enums';

import { UsersEntity } from '../../user/entity/users.entity';
import { CommentsEntity } from './comments.entity';

@Entity('comments_grades')
export class CommentsGradesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.comments_rates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'estimator_id', referencedColumnName: 'id' })
  estimator: UsersEntity;

  @ManyToOne(() => CommentsEntity, (post_comment) => post_comment.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluated_comment_id', referencedColumnName: 'id' })
  evaluated_comment: CommentsEntity;

  @Column({ type: 'int', nullable: false, width: 1 })
  grade: CommentsGradesEnum;
}
