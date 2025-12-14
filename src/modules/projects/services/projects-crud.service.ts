import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { ProjectEntity } from '../entities/project.entity';
import { ServiceEntity } from '../../services/entities/service.entity';
import { SolutionEntity } from '../../solutions/entities/solution.entity';
import { CreateProjectDto } from '../dtos/request/create-project.dto';
import { UpdateProjectDto } from '../dtos/request/update-project.dto';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';
import { JunctionSyncService } from 'src/common/db/junction-sync.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';
import { UploadService } from 'src/shared/modules/upload/services/upload.service';

@Injectable()
export class ProjectsCrudService extends BaseCrudService<ProjectEntity, CreateProjectDto, UpdateProjectDto> {
  constructor(
    @InjectRepository(ProjectEntity) repo: Repository<ProjectEntity>,
    @InjectRepository(ServiceEntity) private readonly serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(SolutionEntity) private readonly solutionRepository: Repository<SolutionEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
    private readonly junctionSync: JunctionSyncService,
    private readonly uploadService: UploadService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Project not found';
  }

  protected createEntityPayload(dto: CreateProjectDto): Partial<ProjectEntity> {
    const {
      name,
      description,
      shortDescription,
      meta,
      challenges,
      results,
      serviceIds,
      solutionIds,
      startDate,
      endDate,
      ...rest
    } = dto;

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
    const { serviceIds, solutionIds, startDate, endDate, ...projectData } = dto;

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
    entity: ProjectEntity,
    dto: CreateProjectDto,
    em: EntityManager,
  ): Promise<void> {
    // Associate services if provided
    if (dto.serviceIds && dto.serviceIds.length > 0) {
      const services = await em.getRepository(ServiceEntity).findBy({ id: In(dto.serviceIds) });
      if (services.length !== dto.serviceIds.length) {
        const foundIds = services.map((s) => s.id);
        const missingIds = dto.serviceIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(`Services with IDs ${missingIds.join(', ')} not found`);
      }

      await this.junctionSync.sync(
        entity.id,
        dto.serviceIds,
        {
          table: 'project_services',
          leftKey: 'project_id',
          rightKey: 'service_id',
        },
        em,
      );
    }

    // Associate solutions if provided
    if (dto.solutionIds && dto.solutionIds.length > 0) {
      const solutions = await em.getRepository(SolutionEntity).findBy({ id: In(dto.solutionIds) });
      if (solutions.length !== dto.solutionIds.length) {
        const foundIds = solutions.map((s) => s.id);
        const missingIds = dto.solutionIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(`Solutions with IDs ${missingIds.join(', ')} not found`);
      }

      await this.junctionSync.sync(
        entity.id,
        dto.solutionIds,
        {
          table: 'solution_projects',
          leftKey: 'project_id',
          rightKey: 'solution_id',
        },
        em,
      );
    }
  }

  protected async syncRelationsOnUpdate(
    entity: ProjectEntity,
    dto: UpdateProjectDto,
    em: EntityManager,
  ): Promise<void> {
    // Handle service associations
    if (dto.serviceIds !== undefined) {
      if (dto.serviceIds.length > 0) {
        const services = await em.getRepository(ServiceEntity).findBy({ id: In(dto.serviceIds) });
        if (services.length !== dto.serviceIds.length) {
          const foundIds = services.map((s) => s.id);
          const missingIds = dto.serviceIds.filter((id) => !foundIds.includes(id));
          throw new BadRequestException(`Services with IDs ${missingIds.join(', ')} not found`);
        }
      }

      await this.junctionSync.sync(
        entity.id,
        dto.serviceIds,
        {
          table: 'project_services',
          leftKey: 'project_id',
          rightKey: 'service_id',
        },
        em,
      );
    }

    // Handle solution associations
    if (dto.solutionIds !== undefined) {
      if (dto.solutionIds.length > 0) {
        const solutions = await em.getRepository(SolutionEntity).findBy({ id: In(dto.solutionIds) });
        if (solutions.length !== dto.solutionIds.length) {
          const foundIds = solutions.map((s) => s.id);
          const missingIds = dto.solutionIds.filter((id) => !foundIds.includes(id));
          throw new BadRequestException(`Solutions with IDs ${missingIds.join(', ')} not found`);
        }
      }

      await this.junctionSync.sync(
        entity.id,
        dto.solutionIds,
        {
          table: 'solution_projects',
          leftKey: 'project_id',
          rightKey: 'solution_id',
        },
        em,
      );
    }
  }

  async update(id: ProjectEntity['id'], dto: UpdateProjectDto): Promise<ProjectEntity> {
    const entity = await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });

    // Store current image for cleanup
    let previousImage: string | null = null;
    if (dto.featuredImage && dto.featuredImage !== entity.featuredImage) {
      previousImage = entity.featuredImage;
    }

    return this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(this.repo.target as any) as Repository<ProjectEntity>;
      const managed = await repo.findOne({
        where: { id } as any,
      });
      if (!managed) throw new Error(this.notFoundMessage());

      this.updateEntityPayload(managed, dto);
      const saved = (await repo.save(managed)) as ProjectEntity;

      await this.syncRelationsOnUpdate(saved, dto, em);

      // Clean up old image if it was replaced
      if (previousImage) {
        this.uploadService.deleteFiles([previousImage]);
      }

      return saved;
    });
  }
}
