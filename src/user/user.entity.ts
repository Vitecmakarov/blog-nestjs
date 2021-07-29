import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as crypto from 'crypto';
@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  mobile: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  registeredAt: number;

  @Column()
  lastLogin: number;

  @Column()
  profileDesc: string;

  @Column()
  avatar: ArrayBuffer;

  @Column()
  isBanned: boolean;

  @BeforeInsert()
  hashPassword() {
    this.passwordHash = crypto
      .createHmac('sha256', this.passwordHash)
      .digest('hex');
  }
}
