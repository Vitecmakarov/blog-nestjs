import { IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @IsUUID(4)
  estimator: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  grade: number;

  constructor(estimator: string, grade: number) {
    this.estimator = estimator;
    this.grade = grade;
  }
}
