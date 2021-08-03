import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 } from 'uuid';

@Entity('post-category')
export class PostCategoryEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  post_id: string;

  @Column({ nullable: false })
  category_id: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
