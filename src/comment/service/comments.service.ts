import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCommentDto } from '../dto/create.coment.dto';
import { UpdateCommentDto } from '../dto/update.comment.dto';
import { UpdateCommentGradesDto } from '../dto/update.comment.grades.dto';

import { CommentsEntity } from '../entity/comments.entity';
import { CommentsGradesEntity } from '../entity/comments.grades.entity';

import { PostsService } from '../../post/service/posts.service';
import { UsersService } from '../../user/service/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
    @InjectRepository(CommentsGradesEntity)
    private readonly commentsGradesRepository: Repository<CommentsGradesEntity>,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  async create(dataDto: CreateCommentDto): Promise<CommentsEntity> {
    const { post_id, user_id, ...post_comment_data } = dataDto;

    const postComment = this.commentsRepository.create(post_comment_data);

    postComment.user = await this.usersService.getById(user_id);
    if (!postComment.user) {
      throw new NotFoundException('User is not found');
    }

    postComment.post = await this.postsService.getById(post_id);
    if (!postComment.post) {
      throw new NotFoundException('Post is not found');
    }

    await this.commentsRepository.save(postComment);

    return postComment;
  }

  async getById(id: string): Promise<CommentsEntity> {
    return await this.commentsRepository.findOne(id, {
      relations: ['user', 'post', 'grades'],
    });
  }

  async getAllByPostId(id: string): Promise<CommentsEntity[]> {
    return await this.commentsRepository.find({
      where: { post: { id: id } },
      relations: ['user', 'post', 'grades'],
    });
  }

  async update(id: string, dataDto: UpdateCommentDto): Promise<void> {
    const comment = await this.commentsRepository.findOne(id);
    await this.commentsRepository.save({ ...comment, ...dataDto });
  }

  async updateRating(evaluated_id: string, data: UpdateCommentGradesDto): Promise<void> {
    const prev_grade = await this.commentsGradesRepository.findOne({
      where: { estimator: { id: data.estimator_id }, evaluated_comment: { id: evaluated_id } },
    });

    if (prev_grade) {
      if (prev_grade.grade === data.grade) {
        await this.commentsGradesRepository.delete(prev_grade.id);
      }
      await this.commentsGradesRepository.save({ ...prev_grade, grade: data.grade });
    } else {
      const estimator = await this.usersService.getById(data.estimator_id);
      if (!estimator) {
        throw new NotFoundException('User not found');
      }
      const evaluated_comment = await this.commentsRepository.findOne(evaluated_id);
      if (!evaluated_comment) {
        throw new NotFoundException('Evaluated comment not found');
      }

      const estimator_grade = this.commentsGradesRepository.create({
        estimator: estimator,
        evaluated_comment: evaluated_comment,
        grade: data.grade,
      });
      await this.commentsGradesRepository.save(estimator_grade);
    }
  }

  async remove(id: string): Promise<void> {
    await this.commentsRepository.delete(id);
  }

  // Only for tests
  async getAll(): Promise<CommentsEntity[]> {
    return await this.commentsRepository.find({
      relations: ['user', 'post', 'grades'],
    });
  }
}
