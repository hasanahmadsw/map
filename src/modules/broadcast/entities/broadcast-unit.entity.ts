import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Index } from 'typeorm';
import { BroadcastType } from '../enums/broadcast-type.enum';

@Entity('broadcast_units')
@Index('IDX_BROADCAST_UNIT_TYPE_ORDER', ['type', 'order'])
@Index('IDX_BROADCAST_UNIT_SLUG', ['slug'], { unique: true })
export class BroadcastUnitEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BroadcastType, default: BroadcastType.OTHER })
  type: BroadcastType;

  @Column()
  slug: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'jsonb', nullable: true })
  specs: any; // flexible specs object

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription: string;

  @Column({ name: 'meta_keywords', type: 'text', nullable: true })
  metaKeywords: string;

  @Column({ type: 'jsonb', nullable: true })
  gallery: any;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'jsonb', nullable: true })
  items: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
