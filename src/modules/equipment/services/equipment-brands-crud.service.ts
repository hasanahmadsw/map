import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentBrandEntity } from '../entities/equipment-brand.entity';
import { CreateEquipmentBrandDto } from '../dtos/request/create-equipment-brand.dto';
import { UpdateEquipmentBrandDto } from '../dtos/request/update-equipment-brand.dto';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';

@Injectable()
export class EquipmentBrandsCrudService {
  constructor(
    @InjectRepository(EquipmentBrandEntity)
    private readonly repo: Repository<EquipmentBrandEntity>,
    private readonly slugGuard: SlugUniquenessService,
  ) {}

  async create(dto: CreateEquipmentBrandDto) {
    await this.slugGuard.assertUnique(this.repo, dto.slug);

    const entity = this.repo.create({
      slug: dto.slug,
      name: dto.name,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateEquipmentBrandDto) {
    const entity = await findByIdOrThrow(this.repo, id, { message: 'Brand not found' });

    if (dto.slug && dto.slug !== entity.slug) {
      await this.slugGuard.assertUnique(this.repo, dto.slug, { excludeId: id });
    }

    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await findByIdOrThrow(this.repo, id, { message: 'Brand not found' });
    await this.repo.remove(entity);
  }
}
