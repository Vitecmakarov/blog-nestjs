import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  JoinTable,
} from 'typeorm';

import { UsersEntity } from '../../user/entity/users.entity';
import { CategoriesEntity } from '../../category/entity/categories.entity';
import { PostsCommentsEntity } from '../../comment/entity/post_comments.entity';
import { PostsImagesEntity } from '../../image/entity/post_images.entity';
import { PostsGradesEntity } from '../../rating/entity/posts.grades.entity';

@Entity('posts')
export class PostsEntity extends BaseEntity {
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

  @OneToMany(() => PostsGradesEntity, (grade) => grade.evaluated)
  grades: PostsGradesEntity[];

  @OneToMany(() => PostsCommentsEntity, (comment) => comment.post)
  comments: PostsCommentsEntity[];

  @OneToOne(() => PostsImagesEntity, (image) => image.post)
  image: PostsImagesEntity;

  @Column({ type: 'float', nullable: false, default: 0 })
  rating: number;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @AfterLoad()
  async calculateRating() {
    if (this.grades && this.grades.length && this.grades.length > 0) {
      this.rating = parseInt(
        (
          this.grades.reduce((sum, value) => {
            return sum + value.grade;
          }, 0) / this.grades.length
        ).toFixed(2),
      );
    }
  }
}
