import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { ServiceEntity } from '../entities/service.entity';
import { ServiceResponseDto } from '../dtos/response/service-response.dto';
import { ServiceFilterDto } from '../dtos/query/service-filter.dto';
import { PublicServiceFilterDto } from '../dtos/query/public-service-filter.dto';

import { PaginationService } from 'src/common/pagination/paginate.service';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { BaseReadService } from 'src/common/crud/base-read.service';
import { paginateAuto } from 'src/common/db/pagination.helper';

@Injectable()
export class ServicesReadService extends BaseReadService<
  ServiceEntity,
  ServiceFilterDto,
  PublicServiceFilterDto,
  ServiceResponseDto
> {
  constructor(
    @InjectRepository(ServiceEntity) repo: Repository<ServiceEntity>,
    pagination: PaginationService,
    viewCounter: ViewCounterService,
  ) {
    super(repo, pagination, viewCounter);
  }

  protected map(entity: ServiceEntity): ServiceResponseDto {
    return ServiceResponseDto.fromEntity(entity);
  }

  protected notFoundMessage(): string {
    return 'Service not found';
  }

  protected createAdminQB(): SelectQueryBuilder<ServiceEntity> {
    return this.repo.createQueryBuilder('service');
  }

  protected createPublicQB(): SelectQueryBuilder<ServiceEntity> {
    return this.repo.createQueryBuilder('service');
  }

  protected shouldUseSafePagination(dto: ServiceFilterDto | PublicServiceFilterDto): boolean {
    // Always use safe pagination when we have JOINs (solutions) to avoid duplicates
    return true;
  }

  async getPublished(dto: PublicServiceFilterDto): Promise<PaginationResponseDto<ServiceResponseDto>> {
    const qb = this.createPublicQB();
    qb.andWhere(`${qb.alias}.isPublished = :isPublished`, { isPublished: true });

    // Join solutions for data loading (not for filtering - we use EXISTS subquery)
    qb.leftJoinAndSelect('service.solutions', 'solutions');

    this.applyPublicFilters(qb, dto);
    this.applyDefaultOrdering(qb);

    return paginateAuto(this.pagination, qb, dto, {
      safe: this.shouldUseSafePagination(dto),
      primaryId: `${qb.alias}.id`,
      createdAt: `${qb.alias}.createdAt`,
      map: (e) => this.map(e),
      orderDirection: (dto as any)?.orderDirection ?? 'DESC',
      orderBy: 'service.order',
    });
  }

  async findAll(dto: ServiceFilterDto): Promise<PaginationResponseDto<ServiceResponseDto>> {
    const qb = this.createAdminQB();

    // Join solutions if solutionId filter is used
    if (dto.solutionId !== undefined) {
      qb.leftJoinAndSelect('service.solutions', 'solutions');
    }

    this.applyAdminFilters(qb, dto);
    this.applyDefaultOrdering(qb);

    return paginateAuto(this.pagination, qb, dto, {
      safe: this.shouldUseSafePagination(dto),
      primaryId: `${qb.alias}.id`,
      createdAt: `${qb.alias}.createdAt`,
      map: (e) => this.map(e),
      orderDirection: dto.orderDirection ?? 'DESC',
      orderBy: 'service.order',
    });
  }

  protected applyAdminFilters(qb: SelectQueryBuilder<ServiceEntity>, filter: ServiceFilterDto): void {
    if (filter.search) {
      qb.andWhere('(service.slug ILIKE :search OR service.name ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.slug) {
      qb.andWhere('service.slug = :slug', { slug: filter.slug });
    }
    if (filter.isPublished !== undefined) {
      qb.andWhere('service.isPublished = :isPublished', { isPublished: filter.isPublished });
    }
    if (filter.isFeatured !== undefined) {
      qb.andWhere('service.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }
    if (filter.order !== undefined) {
      qb.andWhere('service.order = :order', { order: filter.order });
    }
    if (filter.solutionId !== undefined) {
      // Use EXISTS subquery instead of JOIN to avoid issues with paginateSafeQB clearing JOINs
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM solution_services ss 
          WHERE ss.service_id = service.id 
          AND ss.solution_id = :solutionId
        )`,
        { solutionId: filter.solutionId },
      );
    }
  }

  protected applyPublicFilters(qb: SelectQueryBuilder<ServiceEntity>, filter: PublicServiceFilterDto): void {
    if (filter.search) {
      qb.andWhere('(service.name ILIKE :search OR service.description ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.isFeatured !== undefined) {
      qb.andWhere('service.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }
    if (filter.order !== undefined) {
      qb.andWhere('service.order = :order', { order: filter.order });
    }
    if (filter.solutionId !== undefined) {
      // Use EXISTS subquery instead of JOIN to avoid issues with paginateSafeQB clearing JOINs
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM solution_services ss 
          WHERE ss.service_id = service.id 
          AND ss.solution_id = :solutionId
        )`,
        { solutionId: filter.solutionId },
      );
    }
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<ServiceEntity>): void {
    qb.orderBy('service.order', 'ASC').addOrderBy('service.createdAt', 'DESC');
  }
}
