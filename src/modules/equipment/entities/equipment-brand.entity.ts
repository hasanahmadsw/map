import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('equipment_brands')
@Index('IDX_EQUIPMENT_BRAND_SLUG', ['slug'], { unique: true })
export class EquipmentBrandEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string; // canon, arri, red

  @Column()
  name: string; // Canon, ARRI, RED

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
