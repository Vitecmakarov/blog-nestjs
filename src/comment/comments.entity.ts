import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { UsersEntity } from '../user/users.entity';
import { PostsEntity } from '../post/posts.entity';
import { ImagesEntity } from '../image/images.entity';

@Entity('comments')
export class CommentsEntity {
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

  @OneToMany(() => ImagesEntity, (image) => image.comment)
  images: ImagesEntity[];

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_timestamp: string;

  @Column({ type: 'timestamp', nullable: true })
  update_timestamp: string;

  @Column({ type: 'timestamp', nullable: true })
  publish_timestamp: string;
}
