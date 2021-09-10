import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  getConnection,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

import { PostsEntity } from '../../post/entity/posts.entity';
import { UsersEntity } from '../../user/entity/users.entity';

@Entity('categories')
@Tree('materialized-path')
export class CategoriesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  title: string;

  @ManyToOne(() => UsersEntity, (user) => user.created_categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @ManyToMany(() => PostsEntity, (post) => post.categories, {
    onDelete: 'CASCADE',
  })
  posts: PostsEntity[];

  @TreeChildren()
  children: CategoriesEntity[];

  @TreeParent()
  parent: CategoriesEntity;

  async getPosts(): Promise<PostsEntity[]> {
    const categories = await getConnection()
      .getTreeRepository(CategoriesEntity)
      .findDescendants(this);
    categories.push(this);

    const ids = categories.map((category) => category.id);

    return await PostsEntity.createQueryBuilder('post')
      .distinct(true)
      .innerJoin('post.categories', 'category', 'category.id IN (:...ids)', { ids })
      .innerJoinAndSelect('post.categories', 'categories')
      .innerJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.grades', 'grades')
      .leftJoinAndSelect('post.image', 'image')
      .getMany();
  }
}
