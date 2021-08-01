import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 } from 'uuid';

@Entity('post-comment')
export class PostCommentEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  postId: string;

  @Column()
  attachments: Buffer;

  @Column({ length: 500 })
  content: string;

  @Column()
  createdAt: string;

  @Column({ default: null })
  updatedAt: string;

  @Column({ default: null })
  publishedAt: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }

  @BeforeInsert()
  async saveRegistrationTime() {
    this.createdAt = `${Date.now()}`;
  }
}
