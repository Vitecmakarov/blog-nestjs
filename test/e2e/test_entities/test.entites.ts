import { promisify } from 'util';
import { readFile } from 'fs';
import { basename } from 'path';
import { lookup } from 'mime-types';

import { CreateImageDto } from '../../../src/image/dto/images.dto';

import { UsersEntity } from '../../../src/user/users.entity';
import { CategoriesEntity } from '../../../src/category/categories.entity';
import { PostsEntity } from '../../../src/post/posts.entity';
import { CommentsEntity } from '../../../src/comment/comments.entity';

import { UsersService } from '../../../src/user/users.service';
import { CategoriesService } from '../../../src/category/categories.service';
import { PostsService } from '../../../src/post/posts.service';
import { CommentsService } from '../../../src/comment/comments.service';

export class TestEntities {
  constructor(
    private readonly usersService?: UsersService,
    private readonly categoriesService?: CategoriesService,
    private readonly postsService?: PostsService,
    private readonly commentsService?: CommentsService,
  ) {}

  public async createTestUserEntity(): Promise<UsersEntity> {
    return await this.usersService.create({
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      password: 'password_test',
    });
  }

  public async createTestCategoryEntity(
    user_id: string,
  ): Promise<CategoriesEntity> {
    return await this.categoriesService.create({
      user_id: user_id,
      title: 'title_test',
    });
  }

  public async createTestPostEntity(
    user_id: string,
    category_ids: string[],
    image?: CreateImageDto,
  ): Promise<PostsEntity> {
    return await this.postsService.create({
      user_id: user_id,
      category_ids: category_ids,
      title: 'title_test',
      content: 'content_test',
      image: image,
    });
  }

  public async createTestCommentEntity(
    user_id: string,
    post_id: string,
  ): Promise<CommentsEntity> {
    return await this.commentsService.create({
      user_id: user_id,
      post_id: post_id,
      content: 'content_test',
    });
  }

  public async createTestImageDto(): Promise<CreateImageDto> {
    const read = promisify(readFile);
    const pathToTestFile = `${__dirname}/../test_image.png`;

    const image_data = await read(pathToTestFile, { encoding: 'base64' });
    return {
      filename: basename(pathToTestFile),
      type: lookup(pathToTestFile) as string,
      data: image_data,
    };
  }
}
