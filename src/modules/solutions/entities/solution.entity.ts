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
import { ServiceEntity } from '../../services/entities/service.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';

@Entity('solutions')
@Index('IDX_SOLUTION_SLUG', ['slug'], { unique: true })
export class SolutionEntity {
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

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToMany(() => ServiceEntity, (service) => service.solutions)
  @JoinTable({
    name: 'solution_services',
    joinColumn: { name: 'solution_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
  })
  services: ServiceEntity[];

  @ManyToMany(() => ProjectEntity, (project) => project.solutions)
  @JoinTable({
    name: 'solution_projects',
    joinColumn: { name: 'solution_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'project_id', referencedColumnName: 'id' },
  })
  projects: ProjectEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
