import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinTable,
  BeforeInsert,
} from 'typeorm';

import { v4 } from 'uuid';

import { UsersEntity } from '../user/users.entity';
import { PostsEntity } from '../post/posts.entity';
import { CommentsEntity } from '../comment/comments.entity';

@Entity('image')
export class ImagesEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, length: 100 })
  path: string;

  @Column({ nullable: false })
  size: number;

  @Column({ nullable: false })
  extension: string;

  @ManyToOne(() => UsersEntity, (user) => user.avatars, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.images, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  post: PostsEntity;

  @ManyToOne(() => CommentsEntity, (comment) => comment.images, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
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
