import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { BaseReadService } from 'src/common/crud/base-read.service';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';

import { FacilityUnitEntity } from '../entities/facility-unit.entity';
import { FacilityUnitFilterDto } from '../dtos/query/facility-unit-filter.dto';
import { PublicFacilityUnitFilterDto } from '../dtos/query/public-facility-unit-filter.dto';
import { FacilityUnitResponseDto } from '../dtos/response/facility-unit-response.dto';

@Injectable()
export class FacilityUnitsReadService extends BaseReadService<
  FacilityUnitEntity,
  FacilityUnitFilterDto,
  PublicFacilityUnitFilterDto,
  FacilityUnitResponseDto
> {
  constructor(
    @InjectRepository(FacilityUnitEntity) repo: Repository<FacilityUnitEntity>,
    pagination: PaginationService,
    viewCounter: ViewCounterService,
  ) {
    super(repo, pagination, viewCounter);
  }

  protected map(entity: FacilityUnitEntity): FacilityUnitResponseDto {
    return FacilityUnitResponseDto.fromEntity(entity);
  }

  protected notFoundMessage(): string {
    return 'Facility unit not found';
  }

  protected createAdminQB(): SelectQueryBuilder<FacilityUnitEntity> {
    return this.repo.createQueryBuilder('unit').addSelect('unit.items');
  }

  protected createPublicQB(): SelectQueryBuilder<FacilityUnitEntity> {
    return this.repo.createQueryBuilder('unit').addSelect('unit.items').where('unit.isPublished = true');
  }

  protected shouldUseSafePagination(_dto: any): boolean {
    return false; // No JOIN needed
  }

  protected applyAdminFilters(qb: SelectQueryBuilder<FacilityUnitEntity>, filter: FacilityUnitFilterDto): void {
    if (!filter) return;

    if (filter.search) {
      qb.andWhere('(unit.slug ILIKE :search OR unit.title ILIKE :search)', { search: `%${filter.search}%` });
    }
    if (filter.facilityId) qb.andWhere('unit.facilityId = :facilityId', { facilityId: filter.facilityId });
    if (filter.slug) qb.andWhere('unit.slug = :slug', { slug: filter.slug });
    if (filter.isPublished !== undefined)
      qb.andWhere('unit.isPublished = :isPublished', { isPublished: filter.isPublished });
  }

  protected applyPublicFilters(qb: SelectQueryBuilder<FacilityUnitEntity>, filter: PublicFacilityUnitFilterDto): void {
    if (!filter) return;

    if (filter.facilityId) qb.andWhere('unit.facilityId = :facilityId', { facilityId: filter.facilityId });
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<FacilityUnitEntity>): void {
    qb.orderBy('unit.order', 'ASC').addOrderBy('unit.createdAt', 'DESC');
  }
}
