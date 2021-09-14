import { BaseEntity, Entity, ManyToOne, JoinColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../../user/entity/users.entity';
import { PostsEntity } from './posts.entity';

@Entity('posts_grades')
export class PostsGradesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.posts_rates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'estimator_id', referencedColumnName: 'id' })
  estimator: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluated_post_id', referencedColumnName: 'id' })
  evaluated_post: PostsEntity;

  @Column({ type: 'int', nullable: false, width: 2 })
  grade: number;
}
