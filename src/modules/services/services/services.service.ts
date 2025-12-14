import { Injectable } from '@nestjs/common';

import { ServicesReadService } from './services-read.service';
import { ServicesCrudService } from './services-crud.service';

import { CreateServiceDto } from '../dtos/request/create-service.dto';
import { UpdateServiceDto } from '../dtos/request/update-service.dto';
import { ServiceResponseDto } from '../dtos/response/service-response.dto';
import { ServiceFilterDto } from '../dtos/query/service-filter.dto';
import { PublicServiceFilterDto } from '../dtos/query/public-service-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

@Injectable()
export class ServicesService {
  constructor(
    private readonly read: ServicesReadService,
    private readonly crud: ServicesCrudService,
  ) {}

  async create(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    const saved = await this.crud.create(dto);
    return this.read.getById(saved.id, ['solutions']);
  }

  findAll(dto: ServiceFilterDto): Promise<PaginationResponseDto<ServiceResponseDto>> {
    return this.read.findAll(dto);
  }

  getById(id: number): Promise<ServiceResponseDto> {
    return this.read.getById(id, ['solutions']);
  }

  findBySlug(slug: string): Promise<ServiceResponseDto> {
    return this.read.findBySlug(slug, ['solutions']);
  }

  async update(id: number, dto: UpdateServiceDto): Promise<ServiceResponseDto> {
    const saved = await this.crud.update(id, dto);
    return this.read.getById(saved.id, ['solutions']);
  }

  delete(id: number): Promise<void> {
    return this.crud.delete(id);
  }

  async publish(id: number): Promise<ServiceResponseDto> {
    const saved = await this.crud.publish(id);
    return this.read.getById(saved.id, ['solutions']);
  }

  async unpublish(id: number): Promise<ServiceResponseDto> {
    const saved = await this.crud.unpublish(id);
    return this.read.getById(saved.id, ['solutions']);
  }

  async toggleFeatured(id: number): Promise<ServiceResponseDto> {
    const saved = await this.crud.toggleFeatured(id);
    return this.read.getById(saved.id, ['solutions']);
  }

  getPublishedServices(dto: PublicServiceFilterDto) {
    return this.read.getPublished(dto);
  }

  getFeaturedServices(dto: PublicServiceFilterDto) {
    return this.read.getFeatured(dto);
  }

  getBySlugPublic(slug: string) {
    return this.read.getBySlugPublic(slug);
  }
}
