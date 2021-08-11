import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  JoinTable,
} from 'typeorm';

import { v4 } from 'uuid';

import { CategoriesEntity } from '../category/categories.entity';
import { CommentsEntity } from '../comment/comments.entity';
import { ImagesEntity } from '../image/images.entity';
import { UsersEntity } from '../user/users.entity';

@Entity('posts')
export class PostsEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: false })
  content: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_posts, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: UsersEntity;

  @ManyToMany(() => CategoriesEntity, (category) => category.posts, {
    eager: true,
  })
  @JoinTable()
  categories: CategoriesEntity[];

  @OneToMany(() => ImagesEntity, (image) => image.post, {
    eager: true,
  })
  images: ImagesEntity[];

  @OneToMany(() => CommentsEntity, (comment) => comment.post, {
    eager: true,
  })
  comments: CommentsEntity[];

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  created_at: string;

  @Column({ nullable: true, type: 'timestamp' })
  updated_at: string;

  @Column({ nullable: true, type: 'timestamp' })
  published_at: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
