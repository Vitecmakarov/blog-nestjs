import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  JoinTable,
  BeforeInsert,
} from 'typeorm';

import { v4 } from 'uuid';

import { UsersEntity } from '../user/users.entity';
import { PostsEntity } from '../post/posts.entity';
import { ImagesEntity } from '../image/images.entity';

@Entity('comment')
export class CommentsEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_comments, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  post: PostsEntity;

  @OneToMany(() => ImagesEntity, (image) => image.comment)
  @JoinTable()
  images: ImagesEntity[];

  @Column({ nullable: false })
  content: string;

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  create_timestamp: string;

  @Column({ type: 'timestamp', default: null })
  update_timestamp: string;

  @Column({ type: 'timestamp', default: null })
  publish_timestamp: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
