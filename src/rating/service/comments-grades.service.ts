import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostsCommentsGradesEntity } from '../entity/comment.grades.entity';
import { PostCommentsService } from '../../comment/service/post-comments.service';
import { UsersService } from '../../user/service/users.service';

@Injectable()
export class PostsCommentsGradesService {
  constructor(
    @InjectRepository(PostsCommentsGradesEntity)
    private readonly postsCommentsGradesRepository: Repository<PostsCommentsGradesEntity>,
    private readonly usersService: UsersService,
    private readonly postCommentsService: PostCommentsService,
  ) {}
  async add(evaluated_id: string, estimator_id: string, grade: number): Promise<void> {
    const [estimator_prev_grade] = await this.postsCommentsGradesRepository.find({
      where: { estimator: { id: estimator_id }, evaluated: { id: evaluated_id } },
    });

    if (estimator_prev_grade) {
      estimator_prev_grade.grade = grade;
      await this.postsCommentsGradesRepository.save(estimator_prev_grade);
    } else {
      const estimator = await this.usersService.getById(estimator_id);
      if (!estimator) {
        throw new NotFoundException('User with this id not found');
      }
      const evaluated = await this.postCommentsService.getById(evaluated_id);
      if (!evaluated) {
        throw new NotFoundException('User with this id not found');
      }

      const estimator_grade = this.postsCommentsGradesRepository.create({
        evaluated: evaluated,
        estimator: estimator,
        grade: grade,
      });
      await this.postsCommentsGradesRepository.save(estimator_grade);
    }
  }
}
