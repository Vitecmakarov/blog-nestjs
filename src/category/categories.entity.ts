import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PostsEntity } from '../post/posts.entity';
import { UsersEntity } from '../user/users.entity';

@Entity('categories')
export class CategoriesEntity {
  @PrimaryGeneratedColumn('uuid')
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
}
