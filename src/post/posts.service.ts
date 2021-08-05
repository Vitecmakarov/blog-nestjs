import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto, UpdatePostDto, Action } from './dto/posts.dto';
import { PostsEntity } from './posts.entity';
import { CategoriesEntity } from '../category/categories.entity';
import { UsersEntity } from '../user/users.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private postsRepository: Repository<PostsEntity>,
    @InjectRepository(CategoriesEntity)
    private categoriesRepository: Repository<CategoriesEntity>,
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async create(data: CreatePostDto): Promise<void> {
    const { category_ids, user_id, ...postData } = data;

    const post = this.postsRepository.create(postData);

    post.user = await this.usersRepository.findOne(user_id);

    post.categories = await Promise.all(
      category_ids.map(async (categoryId) => {
        return await this.categoriesRepository.findOne(categoryId);
      }),
    );

    await this.postsRepository.save(post);
  }

  async getAll(): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      relations: ['categories', 'user', 'comments'],
    });
  }

  async getById(id: string): Promise<PostsEntity> {
    return await this.postsRepository.findOne(id, {
      relations: ['categories', 'user', 'comments'],
    });
  }

  async getAllByCategoryId(categoryId: string): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      where: { categories: { id: categoryId } },
      relations: ['categories', 'user', 'comments'],
    });
  }

  async getAllByUserId(userId: string): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      where: { user: { id: userId } },
      relations: ['categories', 'user', 'comments'],
    });
  }

  async update(id: string, data: UpdatePostDto): Promise<PostsEntity> {
    const { category_action, ...postData } = data;
    const post = await this.postsRepository.findOne();

    await Promise.all(
      category_action.map(async (action) => {
        switch (action.type) {
          case Action.ADD:
            const category = await this.categoriesRepository.findOne(
              action.category_id,
            );
            post.categories.push(category);
            break;
          case Action.DELETE:
            post.categories = post.categories.filter((category) => {
              return category.id !== action.category_id;
            });
            break;
          default:
            return;
        }
      }),
    );

    return await this.postsRepository.save({ ...post, ...postData });
  }

  async remove(id: string): Promise<void> {
    // TODO: не могу удалить пост т.к. не удаляется из category_post_post и
    // возникает ошибка foreign key constraint fails
    await this.postsRepository.delete(id);
  }
}
