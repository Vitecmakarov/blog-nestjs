import { CommentsEntity } from '../../../src/comment/comments.entity';
import { CommentsService } from '../../../src/comment/comments.service';

export class CommentTestEntity {
  constructor(private readonly commentsService: CommentsService) {}
  async create(user_id: string, post_id: string): Promise<CommentsEntity> {
    return await this.commentsService.create({
      user_id: user_id,
      post_id: post_id,
      content: 'content_test',
    });
  }
}
