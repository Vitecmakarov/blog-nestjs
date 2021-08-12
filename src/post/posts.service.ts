import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto, UpdatePostDto, Action } from './dto/posts.dto';

import { PostsEntity } from './posts.entity';

import { ImagesService } from '../image/images.service';
import { UsersService } from '../user/users.service';
import { CategoriesService } from '../category/categories.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
    private readonly imagesService: ImagesService,
  ) {}

  async create(data: CreatePostDto): Promise<void> {
    const { category_ids, user_id, images, ...postData } = data;

    const post = this.postsRepository.create(postData);

    post.user = await this.usersService.getById(user_id);

    if (!post.user) {
      throw new NotFoundException('User with this id is not exist');
    }

    post.categories = await Promise.all(
      category_ids.map(async (categoryId) => {
        return await this.categoriesService.getById(categoryId);
      }),
    );

    post.images = await Promise.all(
      images.map(async (image) => {
        return await this.imagesService.create(image);
      }),
    );

    await this.postsRepository.save(post);
  }

  async getAll(): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      relations: ['user', 'categories', 'images', 'comments'],
    });
  }

  async getById(id: string): Promise<PostsEntity> {
    return await this.postsRepository.findOne(id, {
      relations: ['user', 'categories', 'images', 'comments'],
    });
  }

  async getAllByCategoryId(categoryId: string): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      where: { categories: { id: categoryId } },
      relations: ['user', 'categories', 'images', 'comments'],
    });
  }

  async getAllByUserId(userId: string): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'categories', 'images', 'comments'],
    });
  }

  async update(id: string, data: UpdatePostDto): Promise<PostsEntity> {
    const { category_actions, image_actions, ...postData } = data;
    const post = await this.postsRepository.findOne(id, {
      relations: ['categories', 'images'],
    });

    await Promise.all(
      category_actions.map(async (action) => {
        switch (action.type) {
          case Action.ADD:
            const category = await this.categoriesService.getById(
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

    await Promise.all(
      image_actions.map(async (image_action) => {
        switch (image_action.type) {
          case Action.ADD:
            const image = await this.imagesService.create(image_action.data);
            post.images.push(image);
            break;
          case Action.DELETE:
            const id = image_action.id;
            post.images = post.images.filter((image) => {
              return image.id !== id;
            });
            await this.imagesService.remove(id);
            break;
          default:
            return;
        }
      }),
    );

    return await this.postsRepository.save({ ...post, ...postData });
  }

  async remove(id: string): Promise<void> {
    const post = await this.postsRepository.findOne(id, {
      relations: ['images'],
    });

    if (!post) {
      throw new NotFoundException('Post with this id is not exist');
    }
    if (post.images.length !== 0) {
      await Promise.all(
        post.images.map(async (image) => {
          await this.imagesService.remove(image.id);
        }),
      );
    }
    await this.postsRepository.delete(id);
  }
}
