import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersGradesEntity } from '../entity/users.grades.entity';
import { UsersService } from '../../user/service/users.service';

@Injectable()
export class UsersGradesService {
  constructor(
    @InjectRepository(UsersGradesEntity)
    private readonly usersGradesRepository: Repository<UsersGradesEntity>,
    private readonly usersService: UsersService,
  ) {}

  async add(evaluated_id: string, estimator_id: string, grade: number): Promise<void> {
    const [estimator_prev_grade] = await this.usersGradesRepository.find({
      where: { estimator: { id: estimator_id }, evaluated: { id: evaluated_id } },
    });

    if (estimator_prev_grade) {
      estimator_prev_grade.grade = grade;
      await this.usersGradesRepository.save(estimator_prev_grade);
    } else {
      const estimator = await this.usersService.getById(estimator_id);
      if (!estimator) {
        throw new NotFoundException('User with this id not found');
      }
      const evaluated = await this.usersService.getById(evaluated_id);
      if (!evaluated) {
        throw new NotFoundException('Post with this id not found');
      }

      const estimator_grade = this.usersGradesRepository.create({
        evaluated: evaluated,
        estimator: estimator,
        grade: grade,
      });
      await this.usersGradesRepository.save(estimator_grade);
    }
  }

  // Only for tests
  async getAll() {
    return this.usersGradesRepository.find({
      relations: ['estimator', 'evaluated'],
    });
  }
}
