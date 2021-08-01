import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 } from 'uuid';

@Entity('category')
export class CategoryEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
