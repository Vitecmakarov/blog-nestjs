import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto, UpdatePostDto, Action } from './dto/posts.dto';
import { PostsEntity } from './posts.entity';
import { CategoriesEntity } from '../category/categories.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private postsRepository: Repository<PostsEntity>,
    @InjectRepository(CategoriesEntity)
    private categoriesRepository: Repository<CategoriesEntity>,
  ) {}

  async create(data: CreatePostDto): Promise<void> {
    const { category_id, ...postData } = data;

    const post = this.postsRepository.create(postData);
    post.categories = await Promise.all(
      category_id.map(async (categoryId) => {
        return await this.categoriesRepository.findOne(categoryId);
      }),
    );

    await this.postsRepository.save(post);
  }

  async getAll(): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      relations: ['categories'],
    });
  }

  async getById(id: string): Promise<PostsEntity> {
    return await this.postsRepository.findOne(id, {
      relations: ['categories'],
    });
  }

  async update(id: string, data: UpdatePostDto): Promise<void> {
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

    await this.postsRepository.save({ ...post, ...postData });
  }

  async remove(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
