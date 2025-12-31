import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { BaseReadService } from 'src/common/crud/base-read.service';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';

import { FacilityEntity } from '../entities/facility.entity';
import { FacilityFilterDto } from '../dtos/query/facility-filter.dto';
import { PublicFacilityFilterDto } from '../dtos/query/public-facility-filter.dto';
import { FacilityResponseDto } from '../dtos/response/facility-response.dto';

@Injectable()
export class FacilitiesReadService extends BaseReadService<
  FacilityEntity,
  FacilityFilterDto,
  PublicFacilityFilterDto,
  FacilityResponseDto
> {
  constructor(
    @InjectRepository(FacilityEntity) repo: Repository<FacilityEntity>,
    pagination: PaginationService,
    viewCounter: ViewCounterService,
  ) {
    super(repo, pagination, viewCounter);
  }

  protected map(entity: FacilityEntity): FacilityResponseDto {
    return FacilityResponseDto.fromEntity(entity);
  }

  protected notFoundMessage(): string {
    return 'Facility not found';
  }

  protected createAdminQB(): SelectQueryBuilder<FacilityEntity> {
    return this.repo.createQueryBuilder('facility').leftJoinAndSelect('facility.units', 'units');
  }

  protected createPublicQB(): SelectQueryBuilder<FacilityEntity> {
    return this.repo
      .createQueryBuilder('facility')
      .leftJoinAndSelect('facility.units', 'units')
      .where('facility.isPublished = true');
  }

  protected shouldUseSafePagination(_dto: any): boolean {
    return true; // because JOIN
  }

  protected applyAdminFilters(qb: SelectQueryBuilder<FacilityEntity>, filter: FacilityFilterDto): void {
    if (!filter) return;

    if (filter.search) {
      qb.andWhere('(facility.slug ILIKE :search OR facility.title ILIKE :search)', { search: `%${filter.search}%` });
    }
    if (filter.solutionId) qb.andWhere('facility.solutionId = :solutionId', { solutionId: filter.solutionId });
    if (filter.type) qb.andWhere('facility.type = :type', { type: filter.type });
    if (filter.slug) qb.andWhere('facility.slug = :slug', { slug: filter.slug });
    if (filter.isPublished !== undefined)
      qb.andWhere('facility.isPublished = :isPublished', { isPublished: filter.isPublished });
  }

  protected applyPublicFilters(qb: SelectQueryBuilder<FacilityEntity>, filter: PublicFacilityFilterDto): void {
    if (!filter) return;

    if (filter.solutionId) qb.andWhere('facility.solutionId = :solutionId', { solutionId: filter.solutionId });
    if (filter.solutionSlug) {
      qb.leftJoin('facility.solution', 'solution').andWhere('solution.slug = :solutionSlug', {
        solutionSlug: filter.solutionSlug,
      });
    }
    if (filter.type) qb.andWhere('facility.type = :type', { type: filter.type });
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<FacilityEntity>): void {
    qb.orderBy('facility.order', 'ASC').addOrderBy('facility.createdAt', 'DESC');
  }
}
