import { BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export class BaseImagesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  path: string;

  @Column({ type: 'int', nullable: false })
  size: number;

  @Column({ type: 'varchar', nullable: false })
  extension: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  upload_timestamp: Date;
}
