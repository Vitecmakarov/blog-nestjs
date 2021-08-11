import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  ManyToOne,
  BeforeInsert,
} from 'typeorm';

import { v4 } from 'uuid';

import { PostsEntity } from '../post/posts.entity';
import { UsersEntity } from '../user/users.entity';

@Entity('categories')
export class CategoriesEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, length: 100 })
  title: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_categories, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: UsersEntity;

  @ManyToMany(() => PostsEntity, (posts) => posts.categories, {
    eager: true,
  })
  posts: PostsEntity[];

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
