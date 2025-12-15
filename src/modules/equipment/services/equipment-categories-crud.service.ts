import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentCategoryEntity } from '../entities/equipment-category.entity';
import { CreateEquipmentCategoryDto } from '../dtos/request/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from '../dtos/request/update-equipment-category.dto';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';

@Injectable()
export class EquipmentCategoriesCrudService {
  constructor(
    @InjectRepository(EquipmentCategoryEntity)
    private readonly repo: Repository<EquipmentCategoryEntity>,
    private readonly slugGuard: SlugUniquenessService,
  ) {}

  async create(dto: CreateEquipmentCategoryDto) {
    await this.slugGuard.assertUnique(this.repo, dto.slug);

    const entity = this.repo.create({
      slug: dto.slug,
      name: dto.name,
      description: dto.description ?? null,
      type: dto.type,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateEquipmentCategoryDto) {
    const entity = await findByIdOrThrow(this.repo, id, { message: 'Category not found' });

    if (dto.slug && dto.slug !== entity.slug) {
      await this.slugGuard.assertUnique(this.repo, dto.slug, { excludeId: id });
    }

    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await findByIdOrThrow(this.repo, id, { message: 'Category not found' });
    await this.repo.remove(entity);
  }
}
