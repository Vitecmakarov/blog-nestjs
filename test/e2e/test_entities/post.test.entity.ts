import { PostsEntity } from '../../../src/post/posts.entity';
import { PostsService } from '../../../src/post/posts.service';

import { CreateImageDto } from '../../../src/image/dto/images.dto';

export class PostTestEntity {
  constructor(private readonly postsService: PostsService) {}
  async create(user_id: string, category_ids: string[], image?: CreateImageDto): Promise<PostsEntity> {
    return await this.postsService.create({
      user_id: user_id,
      category_ids: category_ids,
      title: 'title_test',
      content: 'content_test',
      image: image,
    });
  }
}
