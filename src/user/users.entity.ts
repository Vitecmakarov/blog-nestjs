import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  OneToMany,
  JoinTable,
} from 'typeorm';

import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { PostsEntity } from '../post/posts.entity';
import { CategoriesEntity } from '../category/categories.entity';
import { PostCommentsEntity } from '../post-comment/post-comments.entity';

@Entity('user')
export class UsersEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, length: 50 })
  first_name: string;

  @Column({ nullable: false, length: 50 })
  last_name: string;

  @Column({ nullable: false, length: 15 })
  mobile: string;

  @Column({ nullable: false, length: 50 })
  email: string;

  @Column({ nullable: false })
  password: string;

  @OneToMany(() => PostsEntity, (post) => post.user)
  @JoinTable()
  created_posts: PostsEntity[];

  @OneToMany(() => CategoriesEntity, (category) => category.user)
  @JoinTable()
  created_categories: CategoriesEntity[];

  @OneToMany(() => PostCommentsEntity, (comment) => comment.user)
  @JoinTable()
  created_comments: PostCommentsEntity[];

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  registered_at: string;

  @Column({ nullable: true, type: 'timestamp' })
  last_login: string;

  @Column({ nullable: true, length: 100 })
  profile_desc: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: false, default: false })
  is_banned: boolean;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
