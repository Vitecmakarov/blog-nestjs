import { Entity, Column } from 'typeorm';
@Entity('post-category')
export class PostCategoryEntity {
  @Column()
  postId: number;

  @Column()
  categoryId: number;
}
