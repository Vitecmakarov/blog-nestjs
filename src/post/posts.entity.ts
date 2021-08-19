import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';

import { CategoriesEntity } from '../category/categories.entity';
import { CommentsEntity } from '../comment/comments.entity';
import { ImagesEntity } from '../image/images.entity';
import { UsersEntity } from '../user/users.entity';

@Entity('posts')
export class PostsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: false })
  content: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @ManyToMany(() => CategoriesEntity, (category) => category.posts)
  @JoinTable({
    name: 'posts_categories',
    joinColumn: {
      name: 'post',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category',
      referencedColumnName: 'id',
    },
  })
  categories: CategoriesEntity[];

  @OneToMany(() => ImagesEntity, (image) => image.post)
  images: ImagesEntity[];

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

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
}
