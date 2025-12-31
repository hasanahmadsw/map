import { Injectable } from '@nestjs/common';

import { FacilityUnitsReadService } from './facility-units-read.service';
import { FacilityUnitsCrudService } from './facility-units-crud.service';

import { CreateFacilityUnitDto } from '../dtos/request/create-facility-unit.dto';
import { UpdateFacilityUnitDto } from '../dtos/request/update-facility-unit.dto';
import { FacilityUnitResponseDto } from '../dtos/response/facility-unit-response.dto';
import { FacilityUnitFilterDto } from '../dtos/query/facility-unit-filter.dto';
import { PublicFacilityUnitFilterDto } from '../dtos/query/public-facility-unit-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

@Injectable()
export class FacilityUnitsService {
  constructor(
    private readonly read: FacilityUnitsReadService,
    private readonly crud: FacilityUnitsCrudService,
  ) {}

  async create(dto: CreateFacilityUnitDto): Promise<FacilityUnitResponseDto> {
    const saved = await this.crud.create(dto);
    return this.read.getById(saved.id);
  }

  getById(id: number): Promise<FacilityUnitResponseDto> {
    return this.read.getById(id);
  }

  findBySlug(slug: string): Promise<FacilityUnitResponseDto> {
    return this.read.findBySlug(slug);
  }

  async update(id: number, dto: UpdateFacilityUnitDto): Promise<FacilityUnitResponseDto> {
    const saved = await this.crud.update(id, dto);
    return this.read.getById(saved.id);
  }

  delete(id: number): Promise<void> {
    return this.crud.delete(id);
  }

  async publish(id: number): Promise<FacilityUnitResponseDto> {
    const saved = await this.crud.publish(id);
    return this.read.getById(saved.id);
  }

  async unpublish(id: number): Promise<FacilityUnitResponseDto> {
    const saved = await this.crud.unpublish(id);
    return this.read.getById(saved.id);
  }

  findAll(dto: FacilityUnitFilterDto): Promise<PaginationResponseDto<FacilityUnitResponseDto>> {
    return this.read.findAll(dto);
  }

  getPublished(dto: PublicFacilityUnitFilterDto): Promise<PaginationResponseDto<FacilityUnitResponseDto>> {
    return this.read.getPublished(dto);
  }
}
