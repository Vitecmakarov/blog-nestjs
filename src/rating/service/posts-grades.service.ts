import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostsGradesEntity } from '../entity/posts.grades.entity';
import { PostsService } from '../../post/service/posts.service';
import { UsersService } from '../../user/service/users.service';

@Injectable()
export class PostsGradesService {
  constructor(
    @InjectRepository(PostsGradesEntity)
    private readonly postsGradesRepository: Repository<PostsGradesEntity>,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}
  async add(evaluated_id: string, estimator_id: string, grade: number): Promise<void> {
    const [estimator_prev_grade] = await this.postsGradesRepository.find({
      where: { estimator: { id: estimator_id }, evaluated: { id: evaluated_id } },
    });

    if (estimator_prev_grade) {
      estimator_prev_grade.grade = grade;
      await this.postsGradesRepository.save(estimator_prev_grade);
    } else {
      const estimator = await this.usersService.getById(estimator_id);
      if (!estimator) {
        throw new NotFoundException('User with this id not found');
      }
      const evaluated = await this.postsService.getById(evaluated_id);
      if (!evaluated) {
        throw new NotFoundException('Post with this id not found');
      }

      const estimator_grade = this.postsGradesRepository.create({
        evaluated: evaluated,
        estimator: estimator,
        grade: grade,
      });
      await this.postsGradesRepository.save(estimator_grade);
    }
  }
}
