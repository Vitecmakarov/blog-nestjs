import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 } from 'uuid';

@Entity('category')
export class CategoriesEntity {
  @PrimaryColumn()
  id: string;

  @Column({ length: 100, nullable: false })
  title: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
