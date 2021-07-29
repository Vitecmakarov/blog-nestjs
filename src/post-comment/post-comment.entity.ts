import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity('post-comment')
export class PostCommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  postId: number;

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
