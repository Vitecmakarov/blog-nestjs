import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostCommentDto, UpdatePostCommentDto } from './dto/comments.dto';

import { CommentsEntity } from './comments.entity';

import { PostsService } from '../post/posts.service';
import { UsersService } from '../user/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly postCommentsRepository: Repository<CommentsEntity>,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  async create(dataDto: CreatePostCommentDto): Promise<CommentsEntity> {
    const { post_id, user_id, ...post_comment_data } = dataDto;

    const postComment = this.postCommentsRepository.create(post_comment_data);

    postComment.user = await this.usersService.getById(user_id);
    if (!postComment.user) {
      throw new NotFoundException('User with this id is not exist');
    }

    postComment.post = await this.postsService.getById(post_id);
    if (!postComment.post) {
      throw new NotFoundException('Post with this id is not exist');
    }

    await this.postCommentsRepository.save(postComment);

    return postComment;
  }

  async getById(id: string): Promise<CommentsEntity> {
    return await this.postCommentsRepository.findOne(id, {
      relations: ['user', 'post'],
    });
  }

  async getAllByUserId(id: string): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      where: { user: { id: id } },
      relations: ['user', 'post'],
    });
  }

  async getAllByPostId(id: string): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      where: { post: { id: id } },
      relations: ['user', 'post'],
    });
  }

  async update(id: string, dataDto: UpdatePostCommentDto): Promise<void> {
    await this.postCommentsRepository.update({ id }, dataDto);
  }

  async remove(id: string): Promise<void> {
    await this.postCommentsRepository.delete(id);
  }

  // Only for tests
  async getAll(): Promise<CommentsEntity[]> {
    return await this.postCommentsRepository.find({
      relations: ['user', 'post'],
    });
  }
}
