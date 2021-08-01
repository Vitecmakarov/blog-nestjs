import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 } from 'uuid';

import * as bcrypt from 'bcrypt';

@Entity('user')
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ length: 15 })
  mobile: string;

  @Column({ length: 20 })
  email: string;

  @Column()
  password: string;

  @Column()
  registered_at: string;

  @Column({ default: null })
  last_login: string;

  @Column({ default: null, length: 100 })
  profile_desc: string;

  @Column({ default: null })
  avatar: Buffer;

  @Column({ default: false })
  is_banned: boolean;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }

  @BeforeInsert()
  async saveRegistrationTime() {
    this.registered_at = `${Date.now()}`;
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
