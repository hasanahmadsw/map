import { Injectable } from '@nestjs/common';

import { ProjectsReadService } from './projects-read.service';
import { ProjectsCrudService } from './projects-crud.service';

import { CreateProjectDto } from '../dtos/request/create-project.dto';
import { UpdateProjectDto } from '../dtos/request/update-project.dto';
import { ProjectResponseDto } from '../dtos/response/project-response.dto';
import { ProjectFilterDto } from '../dtos/query/project-filter.dto';
import { PublicProjectFilterDto } from '../dtos/query/public-project-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { UploadService } from 'src/shared/modules/upload/services/upload.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly read: ProjectsReadService,
    private readonly crud: ProjectsCrudService,
    private readonly uploadService: UploadService,
  ) {}

  async uploadPicture(picture: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.uploadService.uploadPicture(picture);
    return { url };
  }

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const saved = await this.crud.create(dto);
    return this.read.getById(saved.id, ['services', 'solutions']);
  }

  findAll(dto: ProjectFilterDto): Promise<PaginationResponseDto<ProjectResponseDto>> {
    return this.read.findAll(dto);
  }

  getById(id: number): Promise<ProjectResponseDto> {
    return this.read.getById(id, ['services', 'solutions']);
  }

  findBySlug(slug: string): Promise<ProjectResponseDto> {
    return this.read.findBySlug(slug, ['services', 'solutions']);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const saved = await this.crud.update(id, dto);
    return this.read.getById(saved.id, ['services', 'solutions']);
  }

  delete(id: number): Promise<void> {
    return this.crud.delete(id);
  }

  async publish(id: number): Promise<ProjectResponseDto> {
    const saved = await this.crud.publish(id);
    return this.read.getById(saved.id, ['services', 'solutions']);
  }

  async unpublish(id: number): Promise<ProjectResponseDto> {
    const saved = await this.crud.unpublish(id);
    return this.read.getById(saved.id, ['services', 'solutions']);
  }

  async toggleFeatured(id: number): Promise<ProjectResponseDto> {
    const saved = await this.crud.toggleFeatured(id);
    return this.read.getById(saved.id, ['services', 'solutions']);
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
