import { Injectable } from '@nestjs/common';

import { SolutionsReadService } from './solutions-read.service';
import { SolutionsCrudService } from './solutions-crud.service';

import { CreateSolutionDto } from '../dtos/request/create-solution.dto';
import { UpdateSolutionDto } from '../dtos/request/update-solution.dto';
import { SolutionResponseDto } from '../dtos/response/solution-response.dto';
import { SolutionFilterDto } from '../dtos/query/solution-filter.dto';
import { PublicSolutionFilterDto } from '../dtos/query/public-solution-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

@Injectable()
export class SolutionsService {
  constructor(
    private readonly read: SolutionsReadService,
    private readonly crud: SolutionsCrudService,
  ) {}

  async create(dto: CreateSolutionDto): Promise<SolutionResponseDto> {
    const saved = await this.crud.create(dto);
    return this.read.getById(saved.id, ['services']);
  }

  findAll(dto: SolutionFilterDto): Promise<PaginationResponseDto<SolutionResponseDto>> {
    return this.read.findAll(dto);
  }

  getById(id: number): Promise<SolutionResponseDto> {
    return this.read.getById(id, ['services']);
  }

  findBySlug(slug: string): Promise<SolutionResponseDto> {
    return this.read.findBySlug(slug, ['services']);
  }

  async update(id: number, dto: UpdateSolutionDto): Promise<SolutionResponseDto> {
    const saved = await this.crud.update(id, dto);
    return this.read.getById(saved.id, ['services']);
  }

  delete(id: number): Promise<void> {
    return this.crud.delete(id);
  }

  async publish(id: number): Promise<SolutionResponseDto> {
    const saved = await this.crud.publish(id);
    return this.read.getById(saved.id, ['services']);
  }

  async unpublish(id: number): Promise<SolutionResponseDto> {
    const saved = await this.crud.unpublish(id);
    return this.read.getById(saved.id, ['services']);
  }

  async toggleFeatured(id: number): Promise<SolutionResponseDto> {
    const saved = await this.crud.toggleFeatured(id);
    return this.read.getById(saved.id, ['services']);
  }

  getPublishedSolutions(dto: PublicSolutionFilterDto) {
    return this.read.getPublished(dto);
  }

  getFeaturedSolutions(dto: PublicSolutionFilterDto) {
    return this.read.getFeatured(dto);
  }

  getBySlugPublic(slug: string) {
    return this.read.getBySlugPublic(slug);
  }
}
