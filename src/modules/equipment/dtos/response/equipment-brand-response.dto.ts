import { EquipmentBrandEntity } from '../../entities/equipment-brand.entity';

export class EquipmentBrandResponseDto {
  id: number;
  slug: string;
  name: string;
  order: number;
  isActive: boolean;

  static fromEntity(entity: EquipmentBrandEntity): EquipmentBrandResponseDto {
    const dto = new EquipmentBrandResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.name = entity.name;
    dto.order = entity.order;
    dto.isActive = entity.isActive;
    return dto;
  }
}
