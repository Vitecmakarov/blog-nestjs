import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { UsersEntity } from '../../user/entity/users.entity';
import { PostsEntity } from '../../post/entity/posts.entity';
import { CommentsGradesEntity } from './comments.grades.entity';

@Entity('comments')
export class CommentsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: PostsEntity;

  @OneToMany(() => CommentsGradesEntity, (grade) => grade.evaluated_comment)
  grades: CommentsGradesEntity[];

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  likes_count: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  dislikes_count: number;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @AfterLoad()
  async calculateRating() {
    if (this.grades && this.grades.length && this.grades.length > 0) {
      this.likes_count = this.grades.filter((grade) => grade.grade === 1).length;
      this.dislikes_count = this.grades.filter((grade) => grade.grade === -1).length;
    }
  }
}
