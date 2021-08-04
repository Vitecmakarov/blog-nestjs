import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';

import { PostsEntity } from '../post/posts.entity';
import { UsersEntity } from '../user/users.entity';

@Entity('category')
export class CategoriesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 100 })
  title: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_categories)
  @JoinTable()
  user: UsersEntity;

  @ManyToMany(() => PostsEntity, (posts) => posts.categories)
  @JoinTable()
  posts: PostsEntity[];
}
