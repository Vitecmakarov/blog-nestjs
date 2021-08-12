import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  ManyToOne,
  BeforeInsert,
  JoinColumn,
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
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @ManyToMany(() => PostsEntity, (posts) => posts.categories)
  posts: PostsEntity[];

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
