import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { SolutionEntity } from '../entities/solution.entity';
import { CreateSolutionDto } from '../dtos/request/create-solution.dto';
import { UpdateSolutionDto } from '../dtos/request/update-solution.dto';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';

@Injectable()
export class SolutionsCrudService extends BaseCrudService<SolutionEntity, CreateSolutionDto, UpdateSolutionDto> {
  constructor(
    @InjectRepository(SolutionEntity) repo: Repository<SolutionEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Solution not found';
  }

  protected createEntityPayload(dto: CreateSolutionDto): Partial<SolutionEntity> {
    const { name, description, shortDescription, meta, ...rest } = dto;

    return {
      slug: rest.slug,
      isPublished: rest.isPublished ?? false,
      isFeatured: rest.isFeatured ?? false,
      featuredImage: rest.featuredImage,
      viewCount: 0,
      icon: rest.icon,
      order: rest.order ?? 0,
      name,
      description: description ?? null,
      shortDescription: shortDescription ?? null,
      meta: meta ?? null,
    };
  }

  protected updateEntityPayload(entity: SolutionEntity, dto: UpdateSolutionDto): void {
    Object.assign(entity, dto);
  }
}
