import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseGradesEntity } from './base.grades.entity';
import { UsersEntity } from '../../user/entity/users.entity';
import { PostsEntity } from '../../post/entity/posts.entity';

@Entity('posts_grades')
export class PostsGradesEntity extends BaseGradesEntity {
  @ManyToOne(() => UsersEntity, (user) => user.posts_grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'estimator_id', referencedColumnName: 'id' })
  estimator: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluated_id', referencedColumnName: 'id' })
  evaluated: PostsEntity;
}
