import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  ManyToOne,
  BeforeInsert,
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
    eager: true,
    onDelete: 'CASCADE',
  })
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.images, {
    onDelete: 'CASCADE',
    eager: true,
  })
  post: PostsEntity;

  @ManyToOne(() => CommentsEntity, (comment) => comment.images, {
    eager: true,
    onDelete: 'CASCADE',
  })
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
