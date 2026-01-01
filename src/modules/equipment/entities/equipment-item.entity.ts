import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EquipmentBrandEntity } from './equipment-brand.entity';
import { EquipmentCategoryEntity } from './equipment-category.entity';
import { EquipmentStatus, EquipmentType } from '../types/equipment.enums';

@Entity('equipment_items')
@Index('IDX_EQUIPMENT_ITEM_SLUG', ['slug'], { unique: true })
@Index('IDX_EQUIPMENT_ITEM_TYPE', ['equipmentType'])
@Index('IDX_EQUIPMENT_ITEM_PUBLISHED', ['isPublished'])
export class EquipmentItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => EquipmentCategoryEntity, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: EquipmentCategoryEntity;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => EquipmentBrandEntity, { nullable: false })
  @JoinColumn({ name: 'brand_id' })
  brand: EquipmentBrandEntity;

  @Column({ name: 'brand_id' })
  brandId: number;

  @Column({ name: 'equipment_type' })
  equipmentType: EquipmentType;

  @Column({ default: false, name: 'is_featured' })
  isFeatured: boolean;

  @Column({ default: false, name: 'is_published' })
  isPublished: boolean;

  @Column({ name: 'cover_path', nullable: true })
  coverPath: string;

  @Column({ name: 'gallery_paths', type: 'jsonb', nullable: true })
  galleryPaths: string[];

  @Column({ name: 'manual_path', nullable: true })
  manualPath: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string;

  // Specs jsonb
  @Column({ type: 'jsonb', nullable: true })
  specs: any;

  @Column({ default: EquipmentStatus.ACTIVE })
  status: EquipmentStatus;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
