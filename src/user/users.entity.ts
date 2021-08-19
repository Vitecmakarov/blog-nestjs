import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import * as bcrypt from 'bcrypt';

import { PostsEntity } from '../post/posts.entity';
import { CategoriesEntity } from '../category/categories.entity';
import { CommentsEntity } from '../comment/comments.entity';
import { ImagesEntity } from '../image/images.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, length: 50 })
  first_name: string;

  @Column({ nullable: false, length: 50 })
  last_name: string;

  @Column({ nullable: false, length: 15 })
  mobile: string;

  @Column({ nullable: false, length: 100 })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: false })
  password: string;

  @OneToMany(() => PostsEntity, (post) => post.user)
  created_posts: PostsEntity[];

  @OneToMany(() => CategoriesEntity, (category) => category.user)
  created_categories: CategoriesEntity[];

  @OneToMany(() => CommentsEntity, (comment) => comment.user)
  created_comments: CommentsEntity[];

  @OneToOne(() => ImagesEntity, (image) => image.user)
  avatar: ImagesEntity;

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  register_at: string;

  @Column({ nullable: true, type: 'timestamp' }) //TODO
  last_login: string;

  @Column({ nullable: true, length: 100 })
  profile_desc: string;

  @Column({ nullable: false, default: false }) //TODO
  is_banned: boolean;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  constructor(
    first_name: string,
    last_name: string,
    mobile: string,
    email: string,
    password: string,
  ) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.mobile = mobile;
    this.email = email;
    this.password = password;
  }
}
