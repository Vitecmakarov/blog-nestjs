import { IsNumber } from 'class-validator';
import { CommentGradeEnum } from '../enums/grades.enums';
import { CreateGradeDto } from './create.grade.dto';

export class CreateCommentGradeDto extends CreateGradeDto {
  @IsNumber()
  grade: CommentGradeEnum;
}
