import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntentEntity } from '../entities/intent.entity';
import { CreateIntentDto } from '../dtos/request/create-intent.dto';
import { UpdateIntentDto } from '../dtos/request/update-intent.dto';
import { IntentResponseDto } from '../dtos/response/intent-response.dto';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';

@Injectable()
export class IntentCrudService {
  constructor(
    @InjectRepository(IntentEntity)
    private readonly repo: Repository<IntentEntity>,
    private readonly slugGuard: SlugUniquenessService,
  ) {}

  async create(dto: CreateIntentDto): Promise<IntentEntity> {
    await this.slugGuard.assertUnique(this.repo, dto.slug);

    const entity = this.repo.create({
      slug: dto.slug,
      type: dto.type,
      parentId: dto.parentId ?? null,
      h1: dto.h1 ?? null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      metaKeywords: dto.metaKeywords ?? null,
      subHeading: dto.subHeading ?? null,
      content: dto.content ?? null,
      linkLabel: dto.linkLabel ?? null,
      equipmentFilters: dto.equipmentFilters ?? null,
    });

    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateIntentDto): Promise<IntentEntity> {
    const entity = await findByIdOrThrow(this.repo, id, { message: 'Intent not found' });

    if (dto.slug && dto.slug !== entity.slug) {
      await this.slugGuard.assertUnique(this.repo, dto.slug, { excludeId: id });
    }

    Object.assign(entity, {
      ...dto,
      parentId: dto.parentId !== undefined ? dto.parentId : entity.parentId,
      h1: dto.h1 !== undefined ? dto.h1 : entity.h1,
      metaTitle: dto.metaTitle !== undefined ? dto.metaTitle : entity.metaTitle,
      metaDescription: dto.metaDescription !== undefined ? dto.metaDescription : entity.metaDescription,
      metaKeywords: dto.metaKeywords !== undefined ? dto.metaKeywords : entity.metaKeywords,
      subHeading: dto.subHeading !== undefined ? dto.subHeading : entity.subHeading,
      content: dto.content !== undefined ? dto.content : entity.content,
      linkLabel: dto.linkLabel !== undefined ? dto.linkLabel : entity.linkLabel,
      equipmentFilters: dto.equipmentFilters !== undefined ? dto.equipmentFilters : entity.equipmentFilters,
    });

    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await findByIdOrThrow(this.repo, id, { message: 'Intent not found' });
    await this.repo.remove(entity);
  }
}
