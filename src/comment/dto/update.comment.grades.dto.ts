import { IsNumber, IsString, IsUUID } from 'class-validator';
import { CommentsGradesEnum } from '../enums/comments.enums';

export class UpdateCommentGradesDto {
  @IsString()
  @IsUUID(4)
  estimator_id: string;

  @IsNumber()
  grade: CommentsGradesEnum;

  constructor(estimator: string, grade: CommentsGradesEnum) {
    this.estimator_id = estimator;
    this.grade = grade;
  }
}
