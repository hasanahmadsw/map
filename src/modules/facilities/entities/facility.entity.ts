import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SolutionEntity } from 'src/modules/solutions/entities/solution.entity';
import { FacilityUnitEntity } from './facility-unit.entity';
import { FacilityType } from '../enums/facility-type.enum';

@Entity('facilities')
@Index('IDX_FACILITY_TYPE_ORDER', ['solutionId', 'type', 'order'])
@Index('IDX_FACILITY_SLUG', ['solutionId', 'slug'], { unique: true })
export class FacilityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'solution_id' })
  solutionId: number;

  @ManyToOne(() => SolutionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'solution_id' })
  solution: SolutionEntity;

  @Column({ type: 'enum', enum: FacilityType, default: FacilityType.OTHER })
  type: FacilityType;

  @Column()
  slug: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ type: 'jsonb', nullable: true })
  gallery: any; // keep flexible (array of {url, alt, ...})

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @OneToMany(() => FacilityUnitEntity, (u) => u.facility, { cascade: false })
  units: FacilityUnitEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
