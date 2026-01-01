import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { SolutionKey } from 'src/modules/solutions/solution-key.enum';
import { ProjectEntity } from 'src/modules/projects/entities/project.entity';
import { SubService } from '../interfaces/sub-service.interface';
import { GalleryItem } from 'src/modules/equipment/types/gallery-item.interface';

@Entity('services')
@Index('IDX_SERVICE_SLUG', ['slug'], { unique: true })
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  @Column({ name: 'sub_services', type: 'jsonb', nullable: true })
  subServices: SubService[];

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage: string;

  @Column({ type: 'jsonb', nullable: true })
  gallery: GalleryItem[];

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'enum', enum: SolutionKey, name: 'solution_key', nullable: true })
  solutionKey: SolutionKey;

  @ManyToMany(() => ProjectEntity, (project) => project.services)
  @JoinTable({
    name: 'project_services',
    joinColumn: { name: 'service_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'project_id', referencedColumnName: 'id' },
  })
  projects: ProjectEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
