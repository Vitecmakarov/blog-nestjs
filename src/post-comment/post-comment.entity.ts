import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 } from 'uuid';

@Entity('post-comment')
export class PostCommentEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  postId: string;

  @Column({ default: null })
  attachments: string;

  @Column({ nullable: false })
  content: string;

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  createdAt: string;

  @Column({ type: 'timestamp', default: null })
  updatedAt: string;

  @Column({ type: 'timestamp', default: null })
  publishedAt: string;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }
}
