import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { PostsEntity } from '../post/posts.entity';
import { CategoriesEntity } from '../category/categories.entity';
import { CommentsEntity } from '../comment/comments.entity';
import { ImagesEntity } from '../image/images.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, length: 50 })
  first_name: string;

  @Column({ nullable: false, length: 50 })
  last_name: string;

  @Column({ nullable: false, length: 15 })
  mobile: string;

  @Column({ nullable: false, length: 100 })
  email: string;

  @Column({ nullable: false })
  password: string;

  @OneToMany(() => PostsEntity, (post) => post.user)
  created_posts: PostsEntity[];

  @OneToMany(() => CategoriesEntity, (category) => category.user)
  created_categories: CategoriesEntity[];

  @OneToMany(() => CommentsEntity, (comment) => comment.user)
  created_comments: CommentsEntity[];

  @OneToOne(() => ImagesEntity, (image) => image.user)
  @JoinColumn({ name: 'avatar_id', referencedColumnName: 'id' })
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
  async generateId() {
    this.id = v4();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
