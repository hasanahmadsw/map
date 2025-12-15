import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { EquipmentItemEntity } from '../entities/equipment-item.entity';
import { EquipmentBrandEntity } from '../entities/equipment-brand.entity';
import { EquipmentCategoryEntity } from '../entities/equipment-category.entity';

import { CreateEquipmentDto } from '../dtos/request/create-equipment.dto';
import { UpdateEquipmentDto } from '../dtos/request/update-equipment.dto';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';

import { EquipmentStatus, EquipmentType } from '../types/equipment.enums';
import { validateEquipmentSpecsOrThrow } from '../specs/equipment-specs.validator';

@Injectable()
export class EquipmentCrudService extends BaseCrudService<EquipmentItemEntity, CreateEquipmentDto, UpdateEquipmentDto> {
  constructor(
    @InjectRepository(EquipmentItemEntity) repo: Repository<EquipmentItemEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Equipment item not found';
  }

  protected createEntityPayload(dto: CreateEquipmentDto): Partial<EquipmentItemEntity> {
    const parsedSpecs = validateEquipmentSpecsOrThrow(dto.equipmentType as EquipmentType, dto.specs);

    return {
      slug: dto.slug,
      name: dto.name,
      summary: dto.summary ?? null,
      description: dto.description ?? null,

      categoryId: dto.categoryId,
      brandId: dto.brandId,

      equipmentType: dto.equipmentType as EquipmentType,

      isPublished: dto.isPublished ?? false,
      isFeatured: dto.isFeatured ?? false,
      order: dto.order ?? 0,

      coverPath: dto.coverPath ?? null,
      galleryPaths: dto.galleryPaths ?? null,
      manualPath: dto.manualPath ?? null,
      videoUrl: dto.videoUrl ?? null,

      specs: parsedSpecs ?? null,
      status: dto.status ?? EquipmentStatus.ACTIVE,

      viewCount: 0,
    };
  }

  protected updateEntityPayload(entity: EquipmentItemEntity, dto: UpdateEquipmentDto): void {
    // assign simple fields first
    Object.assign(entity, dto);

    // Normalize nullable fields (optional, just to keep DB clean)
    if (dto.summary !== undefined && dto.summary === '') entity.summary = null as any;
    if (dto.description !== undefined && dto.description === '') entity.description = null as any;

    // Validate specs if provided OR equipmentType changed
    const nextType = (dto.equipmentType ?? entity.equipmentType) as EquipmentType;

    if (dto.specs !== undefined || dto.equipmentType !== undefined) {
      const parsed = validateEquipmentSpecsOrThrow(nextType, dto.specs ?? entity.specs);
      entity.specs = parsed ?? null;
      entity.equipmentType = nextType;
    }

    // Media fields are paths; keep as-is
  }

  protected async attachRelationsOnCreate(
    _entity: EquipmentItemEntity,
    dto: CreateEquipmentDto,
    em: EntityManager,
  ): Promise<void> {
    const category = await em.getRepository(EquipmentCategoryEntity).findOne({ where: { id: dto.categoryId } });
    if (!category) throw new BadRequestException(`Category with ID ${dto.categoryId} not found`);

    const brand = await em.getRepository(EquipmentBrandEntity).findOne({ where: { id: dto.brandId } });
    if (!brand) throw new BadRequestException(`Brand with ID ${dto.brandId} not found`);
  }

  protected async syncRelationsOnUpdate(
    _entity: EquipmentItemEntity,
    dto: UpdateEquipmentDto,
    em: EntityManager,
  ): Promise<void> {
    if (dto.categoryId !== undefined) {
      const category = await em.getRepository(EquipmentCategoryEntity).findOne({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException(`Category with ID ${dto.categoryId} not found`);
    }

    if (dto.brandId !== undefined) {
      const brand = await em.getRepository(EquipmentBrandEntity).findOne({ where: { id: dto.brandId } });
      if (!brand) throw new BadRequestException(`Brand with ID ${dto.brandId} not found`);
    }
  }

  async publish(id: EquipmentItemEntity['id']): Promise<EquipmentItemEntity> {
    const entity = await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });

    // قواعد نشر بسيطة (اختياري)
    if (!entity.coverPath) {
      throw new BadRequestException('coverPath is required to publish equipment item');
    }

    entity.isPublished = true;
    return this.repo.save(entity);
  }

  async unpublish(id: EquipmentItemEntity['id']): Promise<EquipmentItemEntity> {
    const entity = await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });
    entity.isPublished = false;
    return this.repo.save(entity);
  }

  async toggleFeatured(id: EquipmentItemEntity['id']): Promise<EquipmentItemEntity> {
    const entity = await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });
    entity.isFeatured = !entity.isFeatured;
    return this.repo.save(entity);
  }
}
