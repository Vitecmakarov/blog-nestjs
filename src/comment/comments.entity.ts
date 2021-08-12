import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
} from 'typeorm';

import { v4 } from 'uuid';

import { UsersEntity } from '../user/users.entity';
import { PostsEntity } from '../post/posts.entity';
import { ImagesEntity } from '../image/images.entity';

@Entity('comments')
export class CommentsEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_comments, {
    onDelete: 'CASCADE',
  })
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  post: PostsEntity;

  @OneToMany(() => ImagesEntity, (image) => image.comment)
  images: ImagesEntity[];

  @Column({ nullable: false })
  content: string;

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  create_timestamp: string;

  @Column({ type: 'timestamp', nullable: true })
  update_timestamp: string;

  @Column({ type: 'timestamp', nullable: true })
  publish_timestamp: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
