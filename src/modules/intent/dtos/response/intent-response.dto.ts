import { IntentEntity } from '../../entities/intent.entity';
import { IntentType } from '../../types/intent-type.enum';

export class IntentResponseDto {
  id: number;
  slug: string;
  type: IntentType;
  parentId: number | null;
  h1: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  subHeading: string | null;
  content: string | null;
  linkLabel: string | null;
  equipmentFilters: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: IntentEntity): IntentResponseDto {
    const dto = new IntentResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.type = entity.type;
    dto.parentId = entity.parentId;
    dto.h1 = entity.h1 ?? null;
    dto.metaTitle = entity.metaTitle ?? null;
    dto.metaDescription = entity.metaDescription ?? null;
    dto.metaKeywords = entity.metaKeywords ?? null;
    dto.subHeading = entity.subHeading ?? null;
    dto.content = entity.content ?? null;
    dto.linkLabel = entity.linkLabel ?? null;
    dto.equipmentFilters = entity.equipmentFilters ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
