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

@Entity('projects')
@Index('IDX_PROJECT_SLUG', ['slug'], { unique: true })
export class ProjectEntity {
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

  @Column({ type: 'jsonb', nullable: true })
  challenges: {
    title: string;
    description: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  results: {
    title: string;
    description: string;
  }[];

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

  @Column({ name: 'client_name', nullable: true })
  clientName: string;

  @Column({ name: 'project_url', nullable: true })
  projectUrl: string;

  @Column({ name: 'github_url', nullable: true })
  githubUrl: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  technologies: string[];

  @ManyToMany(() => ServiceEntity, (service) => service.projects)
  @JoinTable({
    name: 'project_services',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
  })
  services: ServiceEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
