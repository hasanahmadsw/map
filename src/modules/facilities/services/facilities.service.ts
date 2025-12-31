import { Injectable } from '@nestjs/common';

import { FacilitiesReadService } from './facilities-read.service';
import { FacilitiesCrudService } from './facilities-crud.service';

import { CreateFacilityDto } from '../dtos/request/create-facility.dto';
import { UpdateFacilityDto } from '../dtos/request/update-facility.dto';
import { FacilityResponseDto } from '../dtos/response/facility-response.dto';
import { FacilityFilterDto } from '../dtos/query/facility-filter.dto';
import { PublicFacilityFilterDto } from '../dtos/query/public-facility-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    private readonly read: FacilitiesReadService,
    private readonly crud: FacilitiesCrudService,
  ) {}

  async create(dto: CreateFacilityDto): Promise<FacilityResponseDto> {
    const saved = await this.crud.create(dto);
    return this.read.getById(saved.id, ['units']);
  }

  findAll(dto: FacilityFilterDto): Promise<PaginationResponseDto<FacilityResponseDto>> {
    return this.read.findAll(dto);
  }

  getById(id: number): Promise<FacilityResponseDto> {
    return this.read.getById(id, ['units']);
  }

  findBySlug(slug: string): Promise<FacilityResponseDto> {
    return this.read.findBySlug(slug, ['units']);
  }

  async update(id: number, dto: UpdateFacilityDto): Promise<FacilityResponseDto> {
    const saved = await this.crud.update(id, dto);
    return this.read.getById(saved.id, ['units']);
  }

  delete(id: number): Promise<void> {
    return this.crud.delete(id);
  }

  async publish(id: number): Promise<FacilityResponseDto> {
    const saved = await this.crud.publish(id);
    return this.read.getById(saved.id, ['units']);
  }

  async unpublish(id: number): Promise<FacilityResponseDto> {
    const saved = await this.crud.unpublish(id);
    return this.read.getById(saved.id, ['units']);
  }

  getPublished(dto: PublicFacilityFilterDto) {
    return this.read.getPublished(dto);
  }

  getFeatured(_dto: any) {
    // not used now, but keep parity if needed later
    return this.read.getFeatured(_dto);
  }

  getBySlugPublic(slug: string) {
    return this.read.getBySlugPublic(slug);
  }
}
