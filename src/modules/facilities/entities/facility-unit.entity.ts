import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FacilityEntity } from './facility.entity';

@Entity('facility_units')
@Index('IDX_FACILITY_UNIT_ORDER', ['facilityId', 'order'])
@Index('IDX_FACILITY_UNIT_SLUG', ['facilityId', 'slug'], { unique: true })
export class FacilityUnitEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'facility_id' })
  facilityId: number;

  @ManyToOne(() => FacilityEntity, (a) => a.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: FacilityEntity;

  @Column()
  slug: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  specs: any; // flexible specs object

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ type: 'jsonb', nullable: true })
  gallery: any;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'jsonb', nullable: true })
  items: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
