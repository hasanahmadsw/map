import { Injectable } from '@nestjs/common';

import { EquipmentReadService } from './equipment-read.service';
import { EquipmentCrudService } from './equipment-crud.service';

import { CreateEquipmentDto } from '../dtos/request/create-equipment.dto';
import { UpdateEquipmentDto } from '../dtos/request/update-equipment.dto';

import { EquipmentResponseDto } from '../dtos/response/equipment-response.dto';
import { EquipmentFilterDto } from '../dtos/query/equipment-filter.dto';
import { PublicEquipmentFilterDto } from '../dtos/query/public-equipment-filter.dto';

import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly read: EquipmentReadService,
    private readonly crud: EquipmentCrudService,
  ) {}

  async create(dto: CreateEquipmentDto): Promise<EquipmentResponseDto> {
    const saved = await this.crud.create(dto);
    return this.read.getById(saved.id, ['category', 'brand']);
  }

  findAll(dto: EquipmentFilterDto): Promise<PaginationResponseDto<EquipmentResponseDto>> {
    return this.read.findAll(dto);
  }

  getById(id: number): Promise<EquipmentResponseDto> {
    return this.read.getById(id, ['category', 'brand']);
  }

  findBySlug(slug: string): Promise<EquipmentResponseDto> {
    return this.read.findBySlug(slug, ['category', 'brand']);
  }

  async update(id: number, dto: UpdateEquipmentDto): Promise<EquipmentResponseDto> {
    const saved = await this.crud.update(id, dto);
    return this.read.getById(saved.id, ['category', 'brand']);
  }

  delete(id: number): Promise<void> {
    return this.crud.delete(id);
  }

  async publish(id: number): Promise<EquipmentResponseDto> {
    const saved = await this.crud.publish(id);
    return this.read.getById(saved.id, ['category', 'brand']);
  }

  async unpublish(id: number): Promise<EquipmentResponseDto> {
    const saved = await this.crud.unpublish(id);
    return this.read.getById(saved.id, ['category', 'brand']);
  }

  async toggleFeatured(id: number): Promise<EquipmentResponseDto> {
    const saved = await this.crud.toggleFeatured(id);
    return this.read.getById(saved.id, ['category', 'brand']);
  }

  getPublished(dto: PublicEquipmentFilterDto) {
    return this.read.getPublished(dto);
  }

  getFeatured(dto: PublicEquipmentFilterDto) {
    return this.read.getFeatured(dto);
  }

  getBySlugPublic(slug: string) {
    return this.read.getBySlugPublic(slug);
  }
}
