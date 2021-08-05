import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToMany,
  ManyToOne,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { v4 } from 'uuid';

import { CategoriesEntity } from '../category/categories.entity';
import { UsersEntity } from '../user/users.entity';
import { PostCommentsEntity } from '../post-comment/post-comments.entity';

@Entity('post')
export class PostsEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: true })
  images: string;

  @Column({ nullable: false })
  content: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_posts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  user: UsersEntity;

  @ManyToMany(() => CategoriesEntity, (category) => category.posts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  categories: CategoriesEntity[];

  @OneToMany(() => PostCommentsEntity, (comment) => comment.post)
  @JoinTable()
  comments: PostCommentsEntity[];

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
