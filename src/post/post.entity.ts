import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity('post')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  attachments: ArrayBuffer;

  @Column()
  content: string;

  @Column()
  createdAt: number;

  @Column()
  updatedAt: number;

  @Column()
  publishedAt: number;
}
