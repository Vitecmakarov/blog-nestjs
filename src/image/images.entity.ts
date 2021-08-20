import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { UsersEntity } from '../user/users.entity';
import { PostsEntity } from '../post/posts.entity';
import { CommentsEntity } from '../comment/comments.entity';

@Entity('images')
export class ImagesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  path: string;

  @Column({ type: 'int', nullable: false })
  size: number;

  @Column({ type: 'varchar', nullable: false })
  extension: string;

  @OneToOne(() => UsersEntity, (user) => user.avatar, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: PostsEntity;

  @ManyToOne(() => CommentsEntity, (comment) => comment.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  comment: CommentsEntity;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  upload_timestamp: string;
}
