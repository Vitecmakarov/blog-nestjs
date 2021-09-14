import { CommentsEntity } from '../../../src/comment/entity/comments.entity';
import { CommentsService } from '../../../src/comment/service/comments.service';
import { MakeRandomString } from './random.string';

export class CommentTestEntity {
  constructor(private readonly commentsService: CommentsService) {}
  async create(user_id: string, post_id: string): Promise<CommentsEntity> {
    return await this.commentsService.create({
      user_id: user_id,
      post_id: post_id,
      content: MakeRandomString(14),
    });
  }
}
