import { Injectable } from '@nestjs/common';

import { ProjectsReadService } from './projects-read.service';
import { ProjectsCrudService } from './projects-crud.service';

import { CreateProjectDto } from '../dtos/request/create-project.dto';
import { UpdateProjectDto } from '../dtos/request/update-project.dto';
import { ProjectResponseDto } from '../dtos/response/project-response.dto';
import { ProjectFilterDto } from '../dtos/query/project-filter.dto';
import { PublicProjectFilterDto } from '../dtos/query/public-project-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly read: ProjectsReadService,
    private readonly crud: ProjectsCrudService,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const saved = await this.crud.create(dto);
    return this.read.getById(saved.id);
  }

  findAll(dto: ProjectFilterDto): Promise<PaginationResponseDto<ProjectResponseDto>> {
    return this.read.findAll(dto);
  }

  getById(id: number): Promise<ProjectResponseDto> {
    return this.read.getById(id);
  }

  findBySlug(slug: string): Promise<ProjectResponseDto> {
    return this.read.findBySlug(slug);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const saved = await this.crud.update(id, dto);
    return this.read.getById(saved.id);
  }

  delete(id: number): Promise<void> {
    return this.crud.delete(id);
  }

  async publish(id: number): Promise<ProjectResponseDto> {
    const saved = await this.crud.publish(id);
    return this.read.getById(saved.id);
  }

  async unpublish(id: number): Promise<ProjectResponseDto> {
    const saved = await this.crud.unpublish(id);
    return this.read.getById(saved.id);
  }

  async toggleFeatured(id: number): Promise<ProjectResponseDto> {
    const saved = await this.crud.toggleFeatured(id);
    return this.read.getById(saved.id);
  }

  getPublishedProjects(dto: PublicProjectFilterDto) {
    return this.read.getPublished(dto);
  }

  getFeaturedProjects(dto: PublicProjectFilterDto) {
    return this.read.getFeatured(dto);
  }

  getBySlugPublic(slug: string) {
    return this.read.getBySlugPublic(slug);
  }
}
