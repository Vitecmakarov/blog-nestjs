import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  JoinTable,
} from 'typeorm';

import { v4 } from 'uuid';

import { UsersEntity } from '../user/users.entity';
import { PostsEntity } from '../post/posts.entity';

@Entity('post-comment')
export class PostCommentsEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_comments)
  @JoinTable()
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.comments)
  @JoinTable()
  post: PostsEntity;

  @Column({ default: null })
  images: string;

  @Column({ nullable: false })
  content: string;

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  createdAt: string;

  @Column({ type: 'timestamp', default: null })
  updatedAt: string;

  @Column({ type: 'timestamp', default: null })
  publishedAt: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
