import { PostsEntity } from '../../../src/post/entity/posts.entity';
import { PostsService } from '../../../src/post/service/posts.service';

import { CreateImageDto } from '../../../src/image/dto/create.image.dto';
import { MakeRandomString } from './random.string';

export class PostTestEntity {
  constructor(private readonly postsService: PostsService) {}
  async create(
    user_id: string,
    category_ids: string[],
    image?: CreateImageDto,
  ): Promise<PostsEntity> {
    return await this.postsService.create({
      user_id: user_id,
      category_ids: category_ids,
      title: MakeRandomString(14),
      content: MakeRandomString(14),
      image: image,
    });
  }
}
