import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
  BeforeInsert,
} from 'typeorm';

import { v4 } from 'uuid';

import { PostsEntity } from '../post/posts.entity';
import { UsersEntity } from '../user/users.entity';

@Entity('category')
export class CategoriesEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, length: 100 })
  title: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_categories, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  user: UsersEntity;

  @ManyToMany(() => PostsEntity, (posts) => posts.categories, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  posts: PostsEntity[];

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
