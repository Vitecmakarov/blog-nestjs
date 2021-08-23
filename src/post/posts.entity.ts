import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column({ type: 'varchar', nullable: false, length: 100 })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @ManyToMany(() => CategoriesEntity, (category) => category.posts, {
    onDelete: 'CASCADE',
  })
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

  @OneToOne(() => ImagesEntity, (image) => image.post)
  image: ImagesEntity;

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: string;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: string;

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
}
