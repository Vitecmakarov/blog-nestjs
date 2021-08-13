import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  ManyToOne,
  BeforeInsert,
  JoinColumn,
} from 'typeorm';

import { v4 } from 'uuid';

import { UsersEntity } from '../user/users.entity';
import { PostsEntity } from '../post/posts.entity';
import { CommentsEntity } from '../comment/comments.entity';

@Entity('images')
export class ImagesEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  path: string;

  @Column({ nullable: false })
  size: number;

  @Column({ nullable: false })
  extension: string;

  @OneToOne(() => UsersEntity, (user) => user.avatar, {
    onDelete: 'CASCADE',
  })
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
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  upload_timestamp: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
