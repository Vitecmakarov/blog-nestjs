import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 } from 'uuid';

@Entity('post')
export class PostEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  user_id: string;

  @Column({ length: 100, nullable: false })
  title: string;

  @Column({ default: null })
  attachments: string;

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

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
