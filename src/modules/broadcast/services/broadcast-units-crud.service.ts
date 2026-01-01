import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';

import { BroadcastUnitEntity } from '../entities/broadcast-unit.entity';
import { CreateBroadcastUnitDto } from '../dtos/request/create-broadcast-unit.dto';
import { UpdateBroadcastUnitDto } from '../dtos/request/update-broadcast-unit.dto';

@Injectable()
export class BroadcastUnitsCrudService extends BaseCrudService<
  BroadcastUnitEntity,
  CreateBroadcastUnitDto,
  UpdateBroadcastUnitDto
> {
  constructor(
    @InjectRepository(BroadcastUnitEntity) repo: Repository<BroadcastUnitEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Broadcast unit not found';
  }

  protected createEntityPayload(dto: CreateBroadcastUnitDto): Partial<BroadcastUnitEntity> {
    return {
      type: dto.type,
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

  protected updateEntityPayload(entity: BroadcastUnitEntity, dto: UpdateBroadcastUnitDto): void {
    Object.assign(entity, dto);
  }
}
