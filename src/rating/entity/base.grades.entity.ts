import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

export class BaseGradesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false, width: 1 })
  grade: number;
}
