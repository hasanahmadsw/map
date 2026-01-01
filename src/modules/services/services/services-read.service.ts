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
    // No longer need safe pagination since we removed solution joins
    // Keep it false unless we have other joins (like projects)
    return false;
  }

  async getPublished(dto: PublicServiceFilterDto): Promise<PaginationResponseDto<ServiceResponseDto>> {
    const qb = this.createPublicQB();
    qb.andWhere(`${qb.alias}.isPublished = :isPublished`, { isPublished: true });

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
    if (filter.solutionKey !== undefined) {
      qb.andWhere('service.solutionKey = :solutionKey', { solutionKey: filter.solutionKey });
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
    if (filter.solutionKey !== undefined) {
      qb.andWhere('service.solutionKey = :solutionKey', { solutionKey: filter.solutionKey });
    }
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<ServiceEntity>): void {
    qb.orderBy('service.order', 'ASC').addOrderBy('service.createdAt', 'DESC');
  }
}
