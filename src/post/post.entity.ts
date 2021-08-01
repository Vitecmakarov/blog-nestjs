import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('post')
export class PostEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  user_id: string;

  @Column({ length: 20 })
  title: string;

  @Column()
  attachments: Buffer;

  @Column({ length: 500 })
  content: string;

  @Column()
  created_at: string;

  @Column()
  updated_at: string;

  @Column()
  published_at: string;
}
