import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EquipmentType } from '../types/equipment.enums';

@Entity('equipment_categories')
@Index('IDX_EQUIPMENT_CATEGORY_SLUG', ['slug'], { unique: true })
export class EquipmentCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string; // cameras, lenses...

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EquipmentType,
  })
  type: EquipmentType;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
