import { EquipmentCategoryEntity } from '../../entities/equipment-category.entity';
import { EquipmentType } from '../../types/equipment.enums';

export class EquipmentCategoryResponseDto {
  id: number;
  slug: string;
  name: string;
  description?: string;
  type: EquipmentType;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: EquipmentCategoryEntity): EquipmentCategoryResponseDto {
    const dto = new EquipmentCategoryResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.name = entity.name;
    dto.description = entity.description ?? undefined;
    dto.type = entity.type;
    dto.order = entity.order;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
