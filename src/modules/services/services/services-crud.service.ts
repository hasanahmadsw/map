import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { ServiceEntity } from '../entities/service.entity';
import { SolutionEntity } from '../../solutions/entities/solution.entity';
import { CreateServiceDto } from '../dtos/request/create-service.dto';
import { UpdateServiceDto } from '../dtos/request/update-service.dto';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';
import { JunctionSyncService } from 'src/common/db/junction-sync.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';

@Injectable()
export class ServicesCrudService extends BaseCrudService<ServiceEntity, CreateServiceDto, UpdateServiceDto> {
  constructor(
    @InjectRepository(ServiceEntity) repo: Repository<ServiceEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
    private readonly junctionSync: JunctionSyncService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Service not found';
  }

  protected createEntityPayload(dto: CreateServiceDto): Partial<ServiceEntity> {
    const { name, description, shortDescription, meta, subServices, solutionIds, ...rest } = dto;

    return {
      slug: rest.slug,
      isPublished: rest.isPublished ?? false,
      isFeatured: rest.isFeatured ?? false,
      featuredImage: rest.featuredImage,
      viewCount: 0,
      icon: rest.icon,
      order: rest.order ?? 0,
      name,
      description: description ?? null,
      shortDescription: shortDescription ?? null,
      meta: meta ?? null,
      subServices: subServices ?? null,
    };
  }

  protected updateEntityPayload(entity: ServiceEntity, dto: UpdateServiceDto): void {
    const { solutionIds, ...serviceData } = dto;
    Object.assign(entity, serviceData);
  }

  protected async attachRelationsOnCreate(
    entity: ServiceEntity,
    dto: CreateServiceDto,
    em: EntityManager,
  ): Promise<void> {
    if (dto.solutionIds && dto.solutionIds.length > 0) {
      const solutions = await em.getRepository(SolutionEntity).findBy({ id: In(dto.solutionIds) });
      entity.solutions = solutions;
      await em.getRepository(ServiceEntity).save(entity);
    }
  }

  protected async syncRelationsOnUpdate(
    entity: ServiceEntity,
    dto: UpdateServiceDto,
    em: EntityManager,
  ): Promise<void> {
    if (dto.solutionIds !== undefined) {
      const solutions = await em.getRepository(SolutionEntity).findBy({ id: In(dto.solutionIds) });
      entity.solutions = solutions;
      await em.getRepository(ServiceEntity).save(entity);
    }
  }

  async delete(id: ServiceEntity['id']): Promise<void> {
    // Validate entity exists
    await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });

    // Remove ManyToMany relationships before deletion
    // Delete from solution_services junction table
    await this.junctionSync.sync(id, [], {
      table: 'solution_services',
      leftKey: 'service_id',
      rightKey: 'solution_id',
    });

    // Delete from project_services junction table
    await this.junctionSync.sync(id, [], {
      table: 'project_services',
      leftKey: 'service_id',
      rightKey: 'project_id',
    });

    await this.repo.delete(id as any);
  }
}
