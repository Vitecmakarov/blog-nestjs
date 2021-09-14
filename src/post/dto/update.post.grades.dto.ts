import { IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';

export class UpdatePostGradesDto {
  @IsString()
  @IsUUID(4)
  estimator_id: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  grade: number;

  constructor(estimator: string, grade: number) {
    this.estimator_id = estimator;
    this.grade = grade;
  }
}
