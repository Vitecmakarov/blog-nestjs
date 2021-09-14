import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('images')
export class ImagesEntity extends BaseEntity {
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
