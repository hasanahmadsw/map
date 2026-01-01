import { Injectable } from '@nestjs/common';

import { BroadcastUnitsReadService } from './broadcast-units-read.service';
import { BroadcastUnitsCrudService } from './broadcast-units-crud.service';

import { CreateBroadcastUnitDto } from '../dtos/request/create-broadcast-unit.dto';
import { UpdateBroadcastUnitDto } from '../dtos/request/update-broadcast-unit.dto';
import { BroadcastUnitResponseDto } from '../dtos/response/broadcast-unit-response.dto';
import { BroadcastUnitFilterDto } from '../dtos/query/broadcast-unit-filter.dto';
import { PublicBroadcastUnitFilterDto } from '../dtos/query/public-broadcast-unit-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

@Injectable()
export class BroadcastUnitsService {
  constructor(
    private readonly read: BroadcastUnitsReadService,
    private readonly crud: BroadcastUnitsCrudService,
  ) {}

  async create(dto: CreateBroadcastUnitDto): Promise<BroadcastUnitResponseDto> {
    const saved = await this.crud.create(dto);
    return this.read.getById(saved.id);
  }

  getById(id: number): Promise<BroadcastUnitResponseDto> {
    return this.read.getById(id);
  }

  findBySlug(slug: string): Promise<BroadcastUnitResponseDto> {
    return this.read.findBySlug(slug);
  }

  async update(id: number, dto: UpdateBroadcastUnitDto): Promise<BroadcastUnitResponseDto> {
    const saved = await this.crud.update(id, dto);
    return this.read.getById(saved.id);
  }

  delete(id: number): Promise<void> {
    return this.crud.delete(id);
  }

  async publish(id: number): Promise<BroadcastUnitResponseDto> {
    const saved = await this.crud.publish(id);
    return this.read.getById(saved.id);
  }

  async unpublish(id: number): Promise<BroadcastUnitResponseDto> {
    const saved = await this.crud.unpublish(id);
    return this.read.getById(saved.id);
  }

  findAll(dto: BroadcastUnitFilterDto): Promise<PaginationResponseDto<BroadcastUnitResponseDto>> {
    return this.read.findAll(dto);
  }

  getPublished(dto: PublicBroadcastUnitFilterDto): Promise<PaginationResponseDto<BroadcastUnitResponseDto>> {
    return this.read.getPublished(dto);
  }
}
