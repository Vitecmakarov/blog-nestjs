import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto } from '../dto/create.post.dto';
import { UpdatePostDto } from '../dto/update.post.dto';
import { UpdatePostGradesDto } from '../dto/update.post.grades.dto';

import { PostCategoryAction } from '../enums/posts.enums';

import { PostsEntity } from '../entity/posts.entity';
import { PostsGradesEntity } from '../entity/posts.grades.entity';

import { ImagesService } from '../../image/service/images.service';
import { CategoriesService } from '../../category/service/categories.service';
import { UsersService } from '../../user/service/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    @InjectRepository(PostsGradesEntity)
    private readonly postsGradesRepository: Repository<PostsGradesEntity>,
    private readonly imagesService: ImagesService,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async create(dataDto: CreatePostDto): Promise<PostsEntity> {
    const { category_ids, user_id, image, ...post_data } = dataDto;

    const post = this.postsRepository.create(post_data);
    post.user = await this.usersService.getById(user_id);
    if (!post.user) {
      throw new NotFoundException('User is not found');
    }

    post.categories = await Promise.all(
      category_ids.map(async (category_id) => {
        return await this.categoriesService.getById(category_id);
      }),
    );

    if (image) {
      post.image = await this.imagesService.create(image);
    }

    await this.postsRepository.save(post);
    return post;
  }

  async getAll(): Promise<PostsEntity[]> {
    return await this.postsRepository.find({
      relations: ['user', 'categories', 'grades', 'comments', 'image'],
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
        await this.imagesService.remove(id);
      }
      post.image = await this.imagesService.create(image);
    }

    return await this.postsRepository.save({ ...post, ...post_data });
  }

  async updateRating(evaluated_id: string, data: UpdatePostGradesDto): Promise<void> {
    const prev_grade = await this.postsGradesRepository.findOne({
      where: { estimator: { id: data.estimator_id }, evaluated_post: { id: evaluated_id } },
    });

    if (prev_grade) {
      await this.postsGradesRepository.save({ ...prev_grade, grade: data.grade });
    } else {
      const estimator = await this.usersService.getById(data.estimator_id);
      if (!estimator) {
        throw new NotFoundException('User not found');
      }
      const evaluated_post = await this.postsRepository.findOne(evaluated_id);
      if (!evaluated_post) {
        throw new NotFoundException('Evaluated post not found');
      }

      const estimator_grade = this.postsGradesRepository.create({
        estimator: estimator,
        evaluated_post: evaluated_post,
        grade: data.grade,
      });
      await this.postsGradesRepository.save(estimator_grade);
    }
  }

  async remove(id: string): Promise<void> {
    const post = await this.postsRepository.findOne(id, {
      relations: ['image'],
    });

    if (post.image) {
      await this.imagesService.remove(post.image.id);
    }
    await this.postsRepository.delete(id);
  }
}
