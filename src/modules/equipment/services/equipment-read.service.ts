import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { EquipmentItemEntity } from '../entities/equipment-item.entity';
import { EquipmentCategoryEntity } from '../entities/equipment-category.entity';
import { EquipmentBrandEntity } from '../entities/equipment-brand.entity';
import { EquipmentResponseDto } from '../dtos/response/equipment-response.dto';
import { EquipmentFilterDto } from '../dtos/query/equipment-filter.dto';
import { PublicEquipmentFilterDto } from '../dtos/query/public-equipment-filter.dto';

import { PaginationService } from 'src/common/pagination/paginate.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { BaseReadService } from 'src/common/crud/base-read.service';

@Injectable()
export class EquipmentReadService extends BaseReadService<
  EquipmentItemEntity,
  EquipmentFilterDto,
  PublicEquipmentFilterDto,
  EquipmentResponseDto
> {
  constructor(
    @InjectRepository(EquipmentItemEntity) repo: Repository<EquipmentItemEntity>,
    pagination: PaginationService,
    viewCounter: ViewCounterService,
  ) {
    super(repo, pagination, viewCounter);
  }

  protected map(entity: EquipmentItemEntity): EquipmentResponseDto {
    return EquipmentResponseDto.fromEntity(entity);
  }

  protected notFoundMessage(): string {
    return 'Equipment item not found';
  }

  protected createAdminQB(): SelectQueryBuilder<EquipmentItemEntity> {
    return this.repo
      .createQueryBuilder('eq')
      .leftJoinAndSelect('eq.category', 'category')
      .leftJoinAndSelect('eq.brand', 'brand');
  }

  protected createPublicQB(): SelectQueryBuilder<EquipmentItemEntity> {
    return this.repo
      .createQueryBuilder('eq')
      .leftJoinAndSelect('eq.category', 'category')
      .leftJoinAndSelect('eq.brand', 'brand');
  }

  protected shouldUseSafePagination(_dto: any): boolean {
    return true; // because we have JOINs
  }

  protected applyAdminFilters(qb: SelectQueryBuilder<EquipmentItemEntity>, filter: EquipmentFilterDto): void {
    if (!filter) return;

    if (filter.search) {
      qb.andWhere(
        '(eq.slug ILIKE :search OR eq.name ILIKE :search OR eq.summary ILIKE :search OR eq.description ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }
    if (filter.categoryId !== undefined) {
      qb.andWhere('eq.categoryId = :categoryId', { categoryId: filter.categoryId });
    }
    if (filter.brandId !== undefined) {
      qb.andWhere('eq.brandId = :brandId', { brandId: filter.brandId });
    }
    if (filter.equipmentType) {
      qb.andWhere('eq.equipmentType = :equipmentType', { equipmentType: filter.equipmentType });
    }
    if (filter.isPublished !== undefined) {
      qb.andWhere('eq.isPublished = :isPublished', { isPublished: filter.isPublished });
    }
    if (filter.isFeatured !== undefined) {
      qb.andWhere('eq.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }
    if (filter.status) {
      qb.andWhere('eq.status = :status', { status: filter.status });
    }
    if (filter.order !== undefined) {
      qb.andWhere('eq.order = :order', { order: filter.order });
    }
  }

  protected applyPublicFilters(qb: SelectQueryBuilder<EquipmentItemEntity>, filter: PublicEquipmentFilterDto): void {
    qb.andWhere('eq.isPublished = true');

    if (!filter) return;

    if (filter.search) {
      qb.andWhere('(eq.name ILIKE :search OR eq.summary ILIKE :search OR eq.description ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.categoryId !== undefined) {
      qb.andWhere('eq.categoryId = :categoryId', { categoryId: filter.categoryId });
    }
    if (filter.brandId !== undefined) {
      qb.andWhere('eq.brandId = :brandId', { brandId: filter.brandId });
    }
    if (filter.category) {
      // Use subquery to avoid needing JOINs (which get cleared by pagination)
      const categorySubQuery = qb.connection
        .createQueryBuilder()
        .select('cat.id')
        .from(EquipmentCategoryEntity, 'cat')
        .where('cat.slug = :categorySlug')
        .getQuery();
      qb.andWhere(`eq.categoryId IN (${categorySubQuery})`);
      qb.setParameter('categorySlug', filter.category);
    }
    if (filter.brand) {
      // Use subquery to avoid needing JOINs (which get cleared by pagination)
      const brandSubQuery = qb.connection
        .createQueryBuilder()
        .select('br.id')
        .from(EquipmentBrandEntity, 'br')
        .where('br.slug = :brandSlug')
        .getQuery();
      qb.andWhere(`eq.brandId IN (${brandSubQuery})`);
      qb.setParameter('brandSlug', filter.brand);
    }
    if (filter.equipmentType) {
      qb.andWhere('eq.equipmentType = :equipmentType', { equipmentType: filter.equipmentType });
    }
    if (filter.isFeatured !== undefined) {
      qb.andWhere('eq.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<EquipmentItemEntity>): void {
    qb.orderBy('eq.order', 'ASC').addOrderBy('eq.createdAt', 'DESC');
  }
}
