import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { IntentType } from '../types/intent-type.enum';

@Entity('intents')
@Index('IDX_INTENT_SLUG', ['slug'], { unique: true })
@Index('IDX_INTENT_TYPE', ['type'])
@Index('IDX_INTENT_PARENT', ['parentId'])
export class IntentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: IntentType,
  })
  type: IntentType;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number | null;

  @ManyToOne(() => IntentEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: IntentEntity | null;

  @OneToMany(() => IntentEntity, (intent) => intent.parent)
  children: IntentEntity[];

  @Column({ nullable: true })
  h1: string | null;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string | null;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription: string | null;

  @Column({ name: 'meta_keywords', type: 'text', nullable: true })
  metaKeywords: string | null;

  @Column({ name: 'sub_heading', nullable: true })
  subHeading: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'link_label', nullable: true })
  linkLabel: string | null;

  @Column({ name: 'equipment_filters', type: 'jsonb', nullable: true })
  equipmentFilters: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
