import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentBrandEntity } from '../entities/equipment-brand.entity';
import { EquipmentBrandResponseDto } from '../dtos/response';
import { EquipmentBrandFilterDto } from '../dtos/query';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { paginateAuto } from 'src/common/db/pagination.helper';

@Injectable()
export class EquipmentBrandsReadService {
  constructor(
    @InjectRepository(EquipmentBrandEntity)
    private readonly repo: Repository<EquipmentBrandEntity>,
    private readonly pagination: PaginationService,
  ) {}

  async findAll(filter: EquipmentBrandFilterDto): Promise<PaginationResponseDto<EquipmentBrandResponseDto>> {
    const qb = this.repo.createQueryBuilder('b');

    if (filter.search) {
      qb.andWhere('(b.name ILIKE :s OR b.slug ILIKE :s)', {
        s: `%${filter.search}%`,
      });
    }

    if (filter.isActive !== undefined) {
      qb.andWhere('b.isActive = :isActive', { isActive: filter.isActive });
    }

    qb.orderBy('b.order', 'ASC').addOrderBy('b.createdAt', 'DESC');

    return paginateAuto(this.pagination, qb, filter, {
      safe: false,
      primaryId: 'b.id',
      createdAt: 'b.createdAt',
      orderBy: 'b.order',
      orderDirection: 'ASC',
      map: (e) => EquipmentBrandResponseDto.fromEntity(e),
    });
  }

  async getActive(dto: PaginationDto): Promise<PaginationResponseDto<EquipmentBrandResponseDto>> {
    const qb = this.repo.createQueryBuilder('b').where('b.isActive = :isActive', { isActive: true });

    qb.orderBy('b.order', 'ASC').addOrderBy('b.createdAt', 'DESC');

    return paginateAuto(this.pagination, qb, dto, {
      safe: false,
      primaryId: 'b.id',
      createdAt: 'b.createdAt',
      orderBy: 'b.order',
      orderDirection: 'ASC',
      map: (e) => EquipmentBrandResponseDto.fromEntity(e),
    });
  }
}
