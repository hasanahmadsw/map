import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { SolutionEntity } from '../entities/solution.entity';
import { SolutionResponseDto } from '../dtos/response/solution-response.dto';
import { SolutionFilterDto } from '../dtos/query/solution-filter.dto';
import { PublicSolutionFilterDto } from '../dtos/query/public-solution-filter.dto';

import { PaginationService } from 'src/common/pagination/paginate.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { BaseReadService } from 'src/common/crud/base-read.service';

@Injectable()
export class SolutionsReadService extends BaseReadService<
  SolutionEntity,
  SolutionFilterDto,
  PublicSolutionFilterDto,
  SolutionResponseDto
> {
  constructor(
    @InjectRepository(SolutionEntity) repo: Repository<SolutionEntity>,
    pagination: PaginationService,
    viewCounter: ViewCounterService,
  ) {
    super(repo, pagination, viewCounter);
  }

  protected map(entity: SolutionEntity): SolutionResponseDto {
    return SolutionResponseDto.fromEntity(entity);
  }

  protected notFoundMessage(): string {
    return 'Solution not found';
  }

  protected createAdminQB(): SelectQueryBuilder<SolutionEntity> {
    return this.repo.createQueryBuilder('solution').leftJoinAndSelect('solution.services', 'services');
  }

  protected createPublicQB(): SelectQueryBuilder<SolutionEntity> {
    return this.repo.createQueryBuilder('solution').leftJoinAndSelect('solution.services', 'services');
  }

  protected shouldUseSafePagination(_dto: any): boolean {
    return true; // because we have JOINs
  }

  protected applyAdminFilters(qb: SelectQueryBuilder<SolutionEntity>, filter: SolutionFilterDto): void {
    if (filter.search) {
      qb.andWhere('(solution.slug ILIKE :search OR solution.name ILIKE :search)', { search: `%${filter.search}%` });
    }
    if (filter.slug) qb.andWhere('solution.slug = :slug', { slug: filter.slug });
    if (filter.isPublished !== undefined)
      qb.andWhere('solution.isPublished = :isPublished', { isPublished: filter.isPublished });
    if (filter.isFeatured !== undefined)
      qb.andWhere('solution.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    if (filter.order !== undefined) qb.andWhere('solution.order = :order', { order: filter.order });
  }

  protected applyPublicFilters(qb: SelectQueryBuilder<SolutionEntity>, filter: PublicSolutionFilterDto): void {
    if (!filter) return;

    if (filter.search) {
      qb.andWhere('(solution.name ILIKE :search OR solution.description ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.isFeatured !== undefined)
      qb.andWhere('solution.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    if (filter.order !== undefined) qb.andWhere('solution.order = :order', { order: filter.order });
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<SolutionEntity>): void {
    qb.orderBy('solution.order', 'ASC').addOrderBy('solution.createdAt', 'DESC');
  }
}
