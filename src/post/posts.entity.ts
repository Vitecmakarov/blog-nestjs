import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToMany,
} from 'typeorm';
import { v4 } from 'uuid';
import { CategoriesEntity } from '../category/categories.entity';

@Entity('post')
export class PostsEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  user_id: string;

  @Column({ length: 100, nullable: false })
  title: string;

  @Column({ default: null })
  images: string;

  @Column({ nullable: false })
  content: string;

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  created_at: string;

  @Column({ type: 'timestamp', default: null })
  updated_at: string;

  @Column({ type: 'timestamp', default: null })
  published_at: string;

  @ManyToMany(() => CategoriesEntity, (category) => category.posts)
  categories: CategoriesEntity[];

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
