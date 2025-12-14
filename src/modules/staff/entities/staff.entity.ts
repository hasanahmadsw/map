import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StaffRole } from '../enums/staff-role.enums';
import * as bcrypt from 'bcryptjs';

@Entity('staff')
// Basic indexes defined here for TypeORM awareness
// Note: Advanced indexes (DESC ordering, GIN indexes, partial indexes) are created via migrations
// See: migrations/1731353000000-AddStaffIndexes.ts and 1731355000000-EnsureStaffIndexes.ts
@Index('idx_staff_created_desc', ['createdAt', 'id'])
@Index('idx_staff_role_created_desc', ['role', 'createdAt', 'id'])
@Index('idx_staff_password_changed_at', ['passwordChangedAt'])
export class StaffEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'image', nullable: true })
  image: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: StaffRole,
  })
  role: StaffRole;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamp', name: 'password_changed_at' })
  passwordChangedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password || this.password.startsWith('$2b$')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
  }
}
