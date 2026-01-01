import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { ProjectEntity } from '../entities/project.entity';
import { ProjectResponseDto } from '../dtos/response/project-response.dto';
import { ProjectFilterDto } from '../dtos/query/project-filter.dto';
import { PublicProjectFilterDto } from '../dtos/query/public-project-filter.dto';

import { PaginationService } from 'src/common/pagination/paginate.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { BaseReadService } from 'src/common/crud/base-read.service';

@Injectable()
export class ProjectsReadService extends BaseReadService<
  ProjectEntity,
  ProjectFilterDto,
  PublicProjectFilterDto,
  ProjectResponseDto
> {
  constructor(
    @InjectRepository(ProjectEntity) repo: Repository<ProjectEntity>,
    pagination: PaginationService,
    viewCounter: ViewCounterService,
  ) {
    super(repo, pagination, viewCounter);
  }

  protected map(entity: ProjectEntity): ProjectResponseDto {
    return ProjectResponseDto.fromEntity(entity);
  }

  protected notFoundMessage(): string {
    return 'Project not found';
  }

  protected createAdminQB(): SelectQueryBuilder<ProjectEntity> {
    return this.repo.createQueryBuilder('project').leftJoinAndSelect('project.services', 'services');
  }

  protected createPublicQB(): SelectQueryBuilder<ProjectEntity> {
    return this.repo.createQueryBuilder('project').leftJoinAndSelect('project.services', 'services');
  }

  protected shouldUseSafePagination(_dto: any): boolean {
    return true; // because we have JOINs
  }

  protected applyAdminFilters(qb: SelectQueryBuilder<ProjectEntity>, filter: ProjectFilterDto): void {
    if (filter.search) {
      qb.andWhere('(project.slug ILIKE :search OR project.name ILIKE :search OR project.description ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.slug) {
      qb.andWhere('project.slug = :slug', { slug: filter.slug });
    }
    if (filter.isPublished !== undefined) {
      qb.andWhere('project.isPublished = :isPublished', { isPublished: filter.isPublished });
    }
    if (filter.isFeatured !== undefined) {
      qb.andWhere('project.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }
    if (filter.order !== undefined) {
      qb.andWhere('project.order = :order', { order: filter.order });
    }
    if (filter.clientName) {
      qb.andWhere('project.clientName ILIKE :clientName', { clientName: `%${filter.clientName}%` });
    }
    if (filter.technology) {
      qb.andWhere('project.technologies @> :technology', { technology: JSON.stringify([filter.technology]) });
    }
    if (filter.startDateFrom) {
      qb.andWhere('project.startDate >= :startDateFrom', { startDateFrom: filter.startDateFrom });
    }
    if (filter.startDateTo) {
      qb.andWhere('project.startDate <= :startDateTo', { startDateTo: filter.startDateTo });
    }
    if (filter.serviceId !== undefined) {
      qb.andWhere('services.id = :serviceId', { serviceId: filter.serviceId });
    }
  }

  protected applyPublicFilters(qb: SelectQueryBuilder<ProjectEntity>, filter: PublicProjectFilterDto): void {
    if (!filter) return;

    if (filter.search) {
      qb.andWhere('(project.name ILIKE :search OR project.description ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.isFeatured !== undefined) {
      qb.andWhere('project.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }
    if (filter.order !== undefined) {
      qb.andWhere('project.order = :order', { order: filter.order });
    }
    if (filter.clientName) {
      qb.andWhere('project.clientName ILIKE :clientName', { clientName: `%${filter.clientName}%` });
    }
    if (filter.technology) {
      qb.andWhere('project.technologies @> :technology', { technology: JSON.stringify([filter.technology]) });
    }
    if (filter.startDateFrom) {
      qb.andWhere('project.startDate >= :startDateFrom', { startDateFrom: filter.startDateFrom });
    }
    if (filter.startDateTo) {
      qb.andWhere('project.startDate <= :startDateTo', { startDateTo: filter.startDateTo });
    }
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<ProjectEntity>): void {
    qb.orderBy('project.order', 'ASC').addOrderBy('project.createdAt', 'DESC');
  }
}
