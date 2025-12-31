import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';

import { FacilityUnitEntity } from '../entities/facility-unit.entity';
import { CreateFacilityUnitDto } from '../dtos/request/create-facility-unit.dto';
import { UpdateFacilityUnitDto } from '../dtos/request/update-facility-unit.dto';

@Injectable()
export class FacilityUnitsCrudService extends BaseCrudService<
  FacilityUnitEntity,
  CreateFacilityUnitDto,
  UpdateFacilityUnitDto
> {
  constructor(
    @InjectRepository(FacilityUnitEntity) repo: Repository<FacilityUnitEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Facility unit not found';
  }

  protected createEntityPayload(dto: CreateFacilityUnitDto): Partial<FacilityUnitEntity> {
    return {
      facilityId: dto.facilityId,
      slug: dto.slug,
      title: dto.title ?? null,
      summary: dto.summary ?? null,
      description: dto.description ?? null,
      specs: dto.specs ?? null,
      coverImage: dto.coverImage ?? null,
      gallery: dto.gallery ?? null,
      isPublished: dto.isPublished ?? false,
      order: dto.order ?? 0,
      items: dto.items ?? null,
    };
  }

  protected updateEntityPayload(entity: FacilityUnitEntity, dto: UpdateFacilityUnitDto): void {
    Object.assign(entity, dto);
  }
}
