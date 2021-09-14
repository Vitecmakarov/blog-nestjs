import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BeforeInsert,
  AfterLoad,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { hash } from 'bcrypt';

import { UsersGradesEntity } from './users.grades.entity';
import { CategoriesEntity } from '../../category/entity/categories.entity';
import { ImagesEntity } from '../../image/entity/images.entity';
import { PostsEntity } from '../../post/entity/posts.entity';
import { PostsGradesEntity } from '../../post/entity/posts.grades.entity';
import { CommentsEntity } from '../../comment/entity/comments.entity';
import { CommentsGradesEntity } from '../../comment/entity/comments.grades.entity';

@Entity('users')
export class UsersEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  first_name: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  last_name: string;

  @Column({ type: 'varchar', nullable: false, length: 15, unique: true })
  mobile: string;

  @Column({ type: 'varchar', nullable: false, length: 100, unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @OneToMany(() => UsersGradesEntity, (grade) => grade.estimator)
  users_rates: UsersGradesEntity[];

  @OneToMany(() => PostsGradesEntity, (grade) => grade.estimator)
  posts_rates: PostsGradesEntity[];

  @OneToMany(() => CommentsGradesEntity, (grade) => grade.estimator)
  comments_rates: CommentsGradesEntity[];

  @OneToMany(() => PostsEntity, (post) => post.user)
  created_posts: PostsEntity[];

  @OneToMany(() => CategoriesEntity, (category) => category.user)
  created_categories: CategoriesEntity[];

  @OneToMany(() => CommentsEntity, (comment) => comment.user)
  created_comments: CommentsEntity[];

  @OneToMany(() => UsersGradesEntity, (grade) => grade.evaluated_user)
  grades: UsersGradesEntity[];

  @OneToOne(() => ImagesEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  avatar: ImagesEntity;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  profile_desc: string;

  @Column({ type: 'float', nullable: false, default: 0 })
  rating: number;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  register_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

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
