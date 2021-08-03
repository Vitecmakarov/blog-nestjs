import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { v4 } from 'uuid';
import { PostsEntity } from '../post/posts.entity';

@Entity('category')
export class CategoriesEntity {
  @PrimaryColumn()
  id: string;

  @Column({ length: 100, nullable: false })
  title: string;

  @ManyToMany(() => PostsEntity, (posts) => posts.categories)
  @JoinTable()
  posts: PostsEntity[];

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
