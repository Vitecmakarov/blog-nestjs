import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { UsersEntity } from '../user/users.entity';
import { PostsEntity } from '../post/posts.entity';

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

  @OneToOne(() => PostsEntity, (post) => post.image, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: PostsEntity;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  upload_timestamp: string;

  constructor(path: string, size: number, extension: string) {
    this.path = path;
    this.size = size;
    this.extension = extension;
  }
}
