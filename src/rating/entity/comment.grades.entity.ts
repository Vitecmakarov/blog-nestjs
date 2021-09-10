import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseGradesEntity } from './base.grades.entity';
import { UsersEntity } from '../../user/entity/users.entity';
import { PostsCommentsEntity } from '../../comment/entity/post_comments.entity';

@Entity('posts_comments_grades')
export class PostsCommentsGradesEntity extends BaseGradesEntity {
  @ManyToOne(() => UsersEntity, (user) => user.comments_grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'estimator_id', referencedColumnName: 'id' })
  estimator: UsersEntity;

  @ManyToOne(() => PostsCommentsEntity, (post_comment) => post_comment.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluated_id', referencedColumnName: 'id' })
  evaluated: PostsCommentsEntity;
}
