import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { BaseReadService } from 'src/common/crud/base-read.service';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';

import { BroadcastUnitEntity } from '../entities/broadcast-unit.entity';
import { BroadcastUnitFilterDto } from '../dtos/query/broadcast-unit-filter.dto';
import { PublicBroadcastUnitFilterDto } from '../dtos/query/public-broadcast-unit-filter.dto';
import { BroadcastUnitResponseDto } from '../dtos/response/broadcast-unit-response.dto';

@Injectable()
export class BroadcastUnitsReadService extends BaseReadService<
  BroadcastUnitEntity,
  BroadcastUnitFilterDto,
  PublicBroadcastUnitFilterDto,
  BroadcastUnitResponseDto
> {
  constructor(
    @InjectRepository(BroadcastUnitEntity) repo: Repository<BroadcastUnitEntity>,
    pagination: PaginationService,
    viewCounter: ViewCounterService,
  ) {
    super(repo, pagination, viewCounter);
  }

  protected map(entity: BroadcastUnitEntity): BroadcastUnitResponseDto {
    return BroadcastUnitResponseDto.fromEntity(entity);
  }

  protected notFoundMessage(): string {
    return 'Broadcast unit not found';
  }

  protected createAdminQB(): SelectQueryBuilder<BroadcastUnitEntity> {
    return this.repo.createQueryBuilder('unit').addSelect('unit.items');
  }

  protected createPublicQB(): SelectQueryBuilder<BroadcastUnitEntity> {
    return this.repo.createQueryBuilder('unit').addSelect('unit.items').where('unit.isPublished = true');
  }

  protected shouldUseSafePagination(_dto: any): boolean {
    return false; // No JOIN needed
  }

  protected applyAdminFilters(qb: SelectQueryBuilder<BroadcastUnitEntity>, filter: BroadcastUnitFilterDto): void {
    if (!filter) return;

    if (filter.search) {
      qb.andWhere('(unit.slug ILIKE :search OR unit.title ILIKE :search)', { search: `%${filter.search}%` });
    }
    if (filter.type) qb.andWhere('unit.type = :type', { type: filter.type });
    if (filter.slug) qb.andWhere('unit.slug = :slug', { slug: filter.slug });
    if (filter.isPublished !== undefined)
      qb.andWhere('unit.isPublished = :isPublished', { isPublished: filter.isPublished });
  }

  protected applyPublicFilters(
    qb: SelectQueryBuilder<BroadcastUnitEntity>,
    filter: PublicBroadcastUnitFilterDto,
  ): void {
    if (!filter) return;

    if (filter.type) qb.andWhere('unit.type = :type', { type: filter.type });
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<BroadcastUnitEntity>): void {
    qb.orderBy('unit.order', 'ASC').addOrderBy('unit.createdAt', 'DESC');
  }
}
