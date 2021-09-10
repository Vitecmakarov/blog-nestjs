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
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { hash } from 'bcrypt';

import { UsersImagesEntity } from '../../image/entity/user_images.entity';
import { UsersGradesEntity } from '../../rating/entity/users.grades.entity';
import { CategoriesEntity } from '../../category/entity/categories.entity';
import { PostsEntity } from '../../post/entity/posts.entity';
import { PostsGradesEntity } from '../../rating/entity/posts.grades.entity';
import { PostsCommentsEntity } from '../../comment/entity/post_comments.entity';
import { PostsCommentsGradesEntity } from '../../rating/entity/comment.grades.entity';

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

  @Exclude({ toPlainOnly: true })
  @OneToMany(() => UsersGradesEntity, (grade) => grade.estimator)
  users_grades: UsersGradesEntity[];

  @Exclude({ toPlainOnly: true })
  @OneToMany(() => PostsGradesEntity, (grade) => grade.estimator)
  posts_grades: PostsGradesEntity[];

  @Exclude({ toPlainOnly: true })
  @OneToMany(() => PostsCommentsGradesEntity, (grade) => grade.estimator)
  comments_grades: PostsCommentsGradesEntity[];

  @Exclude({ toPlainOnly: true })
  @OneToMany(() => PostsEntity, (post) => post.user)
  created_posts: PostsEntity[];

  @Exclude({ toPlainOnly: true })
  @OneToMany(() => CategoriesEntity, (category) => category.user)
  created_categories: CategoriesEntity[];

  @Exclude({ toPlainOnly: true })
  @OneToMany(() => PostsCommentsEntity, (comment) => comment.user)
  created_comments: PostsCommentsEntity[];

  @OneToMany(() => UsersGradesEntity, (grade) => grade.evaluated)
  grades: UsersGradesEntity[];

  @OneToOne(() => UsersImagesEntity, (image) => image.user)
  avatar: UsersImagesEntity;

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
