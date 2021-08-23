import { UsersService } from '../../../src/user/users.service';
import { CategoriesService } from '../../../src/category/categories.service';
import { PostsService } from '../../../src/post/posts.service';
import { CommentsService } from '../../../src/comment/comments.service';
import { CreateImageDto } from '../../../src/image/dto/images.dto';

export class TestEntities {
  constructor(
    private readonly usersService?: UsersService,
    private readonly categoriesService?: CategoriesService,
    private readonly postsService?: PostsService,
    private readonly commentsService?: CommentsService,
  ) {}

  public async createTestUser() {
    await this.usersService.create({
      first_name: 'first_name_test',
      last_name: 'last_name_test',
      mobile: 'mobile_test',
      email: 'email_test',
      password: 'password_test',
    });

    const [user] = await this.usersService.getAll();
    return user;
  }

  public async createTestCategory(user_id: string) {
    await this.categoriesService.create({
      user_id: user_id,
      title: 'title_test',
    });

    const [category] = await this.categoriesService.getAll();
    return category;
  }

  public async createTestPost(
    user_id: string,
    category_ids: string[],
    image?: CreateImageDto,
  ) {
    await this.postsService.create({
      user_id: user_id,
      category_ids: category_ids,
      title: 'title_test',
      content: 'content_test',
      image: image,
    });

    const [post] = await this.postsService.getAll();
    return post;
  }

  public async createTestComment(user_id: string, post_id: string) {
    await this.commentsService.create({
      user_id: user_id,
      post_id: post_id,
      content: 'content_test',
    });

    const [comment] = await this.commentsService.getAll();
    return comment;
  }
}
