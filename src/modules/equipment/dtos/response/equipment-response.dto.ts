import { EquipmentItemEntity } from '../../entities/equipment-item.entity';
import { GalleryItem } from '../../types/gallery-item.interface';

export class EquipmentResponseDto {
  id: number;
  slug: string;
  name: string;
  summary?: string;
  description?: string;

  equipmentType: string;

  isPublished: boolean;
  isFeatured: boolean;
  status: string;

  viewCount: number;

  coverPath?: string;
  gallery?: GalleryItem[];
  manualPath?: string;
  videoUrl?: string;

  specs?: any;

  category?: { id: number; slug: string; name: string };
  brand?: { id: number; slug: string; name: string };

  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: EquipmentItemEntity): EquipmentResponseDto {
    const dto = new EquipmentResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.name = entity.name;
    dto.summary = entity.summary ?? undefined;
    dto.description = entity.description ?? undefined;

    dto.equipmentType = entity.equipmentType;

    dto.isPublished = entity.isPublished;
    dto.isFeatured = entity.isFeatured;
    dto.status = entity.status;

    dto.viewCount = entity.viewCount;

    dto.coverPath = entity.coverPath ?? undefined;
    dto.gallery = entity.gallery ?? undefined;
    dto.manualPath = entity.manualPath ?? undefined;
    dto.videoUrl = entity.videoUrl ?? undefined;

    dto.specs = entity.specs ?? undefined;

    dto.category = entity.category
      ? { id: entity.category.id, slug: entity.category.slug, name: entity.category.name }
      : undefined;

    dto.brand = entity.brand ? { id: entity.brand.id, slug: entity.brand.slug, name: entity.brand.name } : undefined;

    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
