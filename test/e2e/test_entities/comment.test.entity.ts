import { PostsCommentsEntity } from '../../../src/comment/entity/post_comments.entity';
import { PostCommentsService } from '../../../src/comment/service/post-comments.service';
import { MakeRandomString } from './random.string';

export class CommentTestEntity {
  constructor(private readonly commentsService: PostCommentsService) {}
  async create(user_id: string, post_id: string): Promise<PostsCommentsEntity> {
    return await this.commentsService.create({
      user_id: user_id,
      post_id: post_id,
      content: MakeRandomString(14),
    });
  }
}
