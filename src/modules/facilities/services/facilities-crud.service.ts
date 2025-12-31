import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';

import { FacilityEntity } from '../entities/facility.entity';
import { CreateFacilityDto } from '../dtos/request/create-facility.dto';
import { UpdateFacilityDto } from '../dtos/request/update-facility.dto';

@Injectable()
export class FacilitiesCrudService extends BaseCrudService<FacilityEntity, CreateFacilityDto, UpdateFacilityDto> {
  constructor(
    @InjectRepository(FacilityEntity) repo: Repository<FacilityEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Facility not found';
  }

  protected createEntityPayload(dto: CreateFacilityDto): Partial<FacilityEntity> {
    return {
      solutionId: dto.solutionId,
      type: dto.type,
      slug: dto.slug,
      title: dto.title ?? null,
      summary: dto.summary ?? null,
      description: dto.description ?? null,
      coverImage: dto.coverImage ?? null,
      gallery: dto.gallery ?? null,
      isPublished: dto.isPublished ?? false,
      order: dto.order ?? 0,
    };
  }

  protected updateEntityPayload(entity: FacilityEntity, dto: UpdateFacilityDto): void {
    Object.assign(entity, dto);
  }
}
