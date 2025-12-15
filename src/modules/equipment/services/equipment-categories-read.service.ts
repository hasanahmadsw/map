import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentCategoryEntity } from '../entities/equipment-category.entity';
import { EquipmentCategoryResponseDto } from '../dtos/response/equipment-category-response.dto';
import { EquipmentCategoryFilterDto } from '../dtos/query/equipment-category-filter.dto';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { paginateAuto } from 'src/common/db/pagination.helper';

@Injectable()
export class EquipmentCategoriesReadService {
  constructor(
    @InjectRepository(EquipmentCategoryEntity)
    private readonly repo: Repository<EquipmentCategoryEntity>,
    private readonly pagination: PaginationService,
  ) {}

  async findAll(filter: EquipmentCategoryFilterDto): Promise<PaginationResponseDto<EquipmentCategoryResponseDto>> {
    const qb = this.repo.createQueryBuilder('c');

    if (filter.search) {
      qb.andWhere('(c.name ILIKE :s OR c.slug ILIKE :s)', {
        s: `%${filter.search}%`,
      });
    }

    if (filter.isActive !== undefined) {
      qb.andWhere('c.isActive = :isActive', { isActive: filter.isActive });
    }

    qb.orderBy('c.order', 'ASC').addOrderBy('c.createdAt', 'DESC');

    return paginateAuto(this.pagination, qb, filter, {
      safe: false,
      primaryId: 'c.id',
      createdAt: 'c.createdAt',
      orderBy: 'c.order',
      orderDirection: 'ASC',
      map: (e) => EquipmentCategoryResponseDto.fromEntity(e),
    });
  }

  async findOne(id: number) {
    const entity = await findByIdOrThrow(this.repo, id, { message: 'Category not found' });
    return EquipmentCategoryResponseDto.fromEntity(entity);
  }

  async getActive(dto: PaginationDto): Promise<PaginationResponseDto<EquipmentCategoryResponseDto>> {
    const qb = this.repo.createQueryBuilder('c').where('c.isActive = :isActive', { isActive: true });

    qb.orderBy('c.order', 'ASC').addOrderBy('c.createdAt', 'DESC');

    return paginateAuto(this.pagination, qb, dto, {
      safe: false,
      primaryId: 'c.id',
      createdAt: 'c.createdAt',
      orderBy: 'c.order',
      orderDirection: 'ASC',
      map: (e) => EquipmentCategoryResponseDto.fromEntity(e),
    });
  }
}
