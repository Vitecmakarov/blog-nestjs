import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Entity('user')
export class UsersEntity {
  @PrimaryColumn()
  id: string;

  @Column({ length: 50, nullable: false })
  first_name: string;

  @Column({ length: 50, nullable: false })
  last_name: string;

  @Column({ length: 15, nullable: false })
  mobile: string;

  @Column({ length: 100, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  registered_at: string;

  @Column({ type: 'timestamp', default: null })
  last_login: string;

  @Column({ length: 100, default: null })
  profile_desc: string;

  @Column({ default: null })
  avatar: string;

  @Column({ default: false })
  is_banned: boolean;

  @BeforeInsert()
  async generateId() {
    this.id = v4();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
