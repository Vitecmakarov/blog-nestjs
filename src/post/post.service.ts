import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto, UpdatePostDto, Action } from './dto/post.dto';
import { PostEntity } from './post.entity';
import { PostCategoryEntity } from './post-category.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
    private postsCategoryRepository: Repository<PostCategoryEntity>,
  ) {}

  async create(data: CreatePostDto): Promise<void> {
    const { category_id, ...postData } = data;

    const post = this.postsRepository.create(postData);

    category_id.forEach((category) => {
      const postsCategory = this.postsCategoryRepository.create({
        post_id: post.id,
        category_id: category,
      });
      this.postsRepository.save(postsCategory);
    });

    await this.postsRepository.save(post);
  }

  async getAll(): Promise<PostEntity[]> {
    return await this.postsRepository.find();
  }

  async getById(id: string): Promise<PostEntity> {
    return await this.postsRepository.findOne(id);
  }

  async update(id: string, data: UpdatePostDto): Promise<void> {
    const { category_action, ...postData } = data;
    if (category_action.length !== 0) {
      category_action.forEach((action) => {
        switch (action.type) {
          case Action.ADD:
            this.postsCategoryRepository.create({
              post_id: id,
              category_id: action.id,
            });
            break;
          case Action.DELETE:
            break;
        }
      });
    }
    await this.postsRepository.update({ id }, postData);
  }

  async remove(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
