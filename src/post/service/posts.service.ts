import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto } from '../dto/create.post.dto';
import { UpdatePostDto } from '../dto/update.post.dto';
import { PostCategoryAction } from '../enums/posts.enums';

import { PostsEntity } from '../entity/posts.entity';

import { PostImagesService } from '../../image/service/post_images.service';
import { CategoriesService } from '../../category/service/categories.service';
import { UsersService } from '../../user/service/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    private readonly postImagesService: PostImagesService,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async create(dataDto: CreatePostDto): Promise<PostsEntity> {
    const { category_ids, user_id, image, ...post_data } = dataDto;

    const post = this.postsRepository.create(post_data);
    post.user = await this.usersService.getById(user_id);
    if (!post.user) {
      throw new NotFoundException('User with this id is not exist');
    }

    post.categories = await Promise.all(
      category_ids.map(async (category_id) => {
        return await this.categoriesService.getById(category_id);
      }),
    );

    if (image) {
      post.image = await this.postImagesService.create(image);
    }

    await this.postsRepository.save(post);
    return post;
  }

  async getAll(): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      relations: ['user', 'categories', 'grades', 'comments', 'image'],
      order: {
        created_at: 'ASC',
      },
    });
  }

  async getById(id: string): Promise<PostsEntity> {
    return await this.postsRepository.findOne(id, {
      relations: ['user', 'categories', 'grades', 'comments', 'image'],
    });
  }

  async getAllByCategoryId(categoryId: string): Promise<PostsEntity[]> {
    const category = await this.categoriesService.getById(categoryId);
    return await category.getPosts();
  }

  async update(id: string, data: UpdatePostDto): Promise<PostsEntity> {
    const { category_actions, image, ...post_data } = data;
    const post = await this.postsRepository.findOne(id, {
      relations: ['categories', 'image'],
    });

    if (category_actions.length !== 0) {
      await Promise.all(
        category_actions.map(async (action) => {
          switch (action.type) {
            case PostCategoryAction.ADD:
              const category = await this.categoriesService.getById(action.category_id);
              post.categories.push(category);
              break;
            case PostCategoryAction.DELETE:
              post.categories = post.categories.filter((category) => {
                return category.id !== action.category_id;
              });
              break;
            default:
              return;
          }
        }),
      );
    }

    if (image) {
      if (post.image) {
        await this.postImagesService.remove(id);
      }
      post.image = await this.postImagesService.create(image);
    }

    return await this.postsRepository.save({ ...post, ...post_data });
  }

  async remove(id: string): Promise<void> {
    const post = await this.postsRepository.findOne(id, {
      relations: ['image'],
    });

    if (post.image) {
      await this.postImagesService.remove(post.image.id);
    }
    await this.postsRepository.delete(id);
  }
}
