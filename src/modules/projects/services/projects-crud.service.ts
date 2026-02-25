import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { ProjectEntity } from '../entities/project.entity';
import { CreateProjectDto } from '../dtos/request/create-project.dto';
import { UpdateProjectDto } from '../dtos/request/update-project.dto';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';

@Injectable()
export class ProjectsCrudService extends BaseCrudService<ProjectEntity, CreateProjectDto, UpdateProjectDto> {
  constructor(
    @InjectRepository(ProjectEntity) repo: Repository<ProjectEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Project not found';
  }

  protected createEntityPayload(dto: CreateProjectDto): Partial<ProjectEntity> {
    const { name, description, shortDescription, meta, challenges, results, startDate, endDate, ...rest } = dto;

    return {
      slug: rest.slug,
      isPublished: rest.isPublished ?? false,
      isFeatured: rest.isFeatured ?? false,
      featuredImage: rest.featuredImage,
      viewCount: 0,
      icon: rest.icon,
      order: rest.order ?? 0,
      clientName: rest.clientName,
      projectUrl: rest.projectUrl,
      githubUrl: rest.githubUrl,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      technologies: rest.technologies,
      name,
      description: description ?? null,
      shortDescription: shortDescription ?? null,
      meta: meta ?? null,
      challenges: challenges ?? null,
      results: results ?? null,
    };
  }

  protected updateEntityPayload(entity: ProjectEntity, dto: UpdateProjectDto): void {
    const { startDate, endDate, ...projectData } = dto;

    // Handle date fields
    if (startDate !== undefined) {
      entity.startDate = startDate ? new Date(startDate) : null;
    }
    if (endDate !== undefined) {
      entity.endDate = endDate ? new Date(endDate) : null;
    }

    Object.assign(entity, projectData);
  }

  protected async attachRelationsOnCreate(
    _entity: ProjectEntity,
    _dto: CreateProjectDto,
    _em: EntityManager,
  ): Promise<void> {
    // No relations to attach after removing services
  }

  protected async syncRelationsOnUpdate(
    _entity: ProjectEntity,
    _dto: UpdateProjectDto,
    _em: EntityManager,
  ): Promise<void> {
    // No relations to sync after removing services
  }

  async update(id: ProjectEntity['id'], dto: UpdateProjectDto): Promise<ProjectEntity> {
    const entity = await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });

    return this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(this.repo.target as any) as Repository<ProjectEntity>;
      const managed = await repo.findOne({
        where: { id } as any,
      });
      if (!managed) throw new Error(this.notFoundMessage());

      this.updateEntityPayload(managed, dto);
      const saved = (await repo.save(managed)) as ProjectEntity;

      await this.syncRelationsOnUpdate(saved, dto, em);

      return saved;
    });
  }
}
