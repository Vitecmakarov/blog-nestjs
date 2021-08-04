import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreatePostCommentDto,
  UpdatePostComment,
} from './dto/post-comments.dto';

import { PostsEntity } from '../post/posts.entity';
import { UsersEntity } from '../user/users.entity';
import { PostCommentsEntity } from './post-comments.entity';

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(PostsEntity)
    private postsRepository: Repository<PostsEntity>,
    @InjectRepository(PostCommentsEntity)
    private postCommentsRepository: Repository<PostCommentsEntity>,
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async create(data: CreatePostCommentDto): Promise<void> {
    const { post_id, user_id, ...postCommentData } = data;

    const postComment = this.postCommentsRepository.create(postCommentData);

    postComment.user = await this.usersRepository.findOne(user_id);

    postComment.post = await this.postsRepository.findOne(post_id);

    await this.postsRepository.save(postComment);
  }

  async getAll(): Promise<PostCommentsEntity[]> {
    return await this.postCommentsRepository.find({
      relations: ['post', 'user'],
    });
  }

  async getById(id: string): Promise<PostCommentsEntity> {
    return await this.postCommentsRepository.findOne(id, {
      relations: ['post', 'user'],
    });
  }

  async getAllByUserId(id: string): Promise<PostCommentsEntity[]> {
    return await this.postCommentsRepository.find({
      where: { user: { id: id } },
      relations: ['post', 'user'],
    });
  }

  async getAllByPostId(id: string): Promise<PostCommentsEntity[]> {
    return await this.postCommentsRepository.find({
      where: { post: { id: id } },
      relations: ['post', 'user'],
    });
  }

  async update(id: string, data: UpdatePostComment): Promise<void> {
    await this.postsRepository.update(id, { ...data });
  }

  async remove(id: string): Promise<void> {
    await this.postCommentsRepository.delete(id);
  }
}
