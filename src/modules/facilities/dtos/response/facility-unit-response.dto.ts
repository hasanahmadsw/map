import { FacilityUnitEntity } from '../../entities/facility-unit.entity';
import { FacilityUnitItemGroup } from '../../enums/facility-unit-item.enum';

export class FacilityUnitItemResponseDto {
  group?: FacilityUnitItemGroup; // e.g. FacilityUnitItemGroup.CAMERAS
  title: string; // itemTitle
  qty?: number; // quantity
  notes?: string;
  order?: number;
}

export class FacilityUnitResponseDto {
  id: number;
  facilityId: number;
  slug: string;
  title?: string;
  summary?: string;
  description?: string;
  specs?: any;
  coverImage?: string;
  gallery?: any;
  isPublished: boolean;
  order: number;
  items?: FacilityUnitItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(e: FacilityUnitEntity): FacilityUnitResponseDto {
    const dto = new FacilityUnitResponseDto();
    dto.id = e.id;
    dto.facilityId = e.facilityId;
    dto.slug = e.slug;
    dto.title = e.title ?? undefined;
    dto.summary = e.summary ?? undefined;
    dto.description = e.description ?? undefined;
    dto.specs = e.specs ?? undefined;
    dto.coverImage = e.coverImage ?? undefined;
    dto.gallery = e.gallery ?? undefined;
    dto.isPublished = e.isPublished;
    dto.order = e.order;

    // Map items array from JSONB column
    if (e.items && Array.isArray(e.items)) {
      dto.items = e.items.map((item: any) => ({
        group: item.group ?? undefined,
        title: item.title,
        qty: item.qty ?? undefined,
        notes: item.notes ?? undefined,
        order: item.order ?? undefined,
      }));
    } else {
      dto.items = undefined;
    }

    dto.createdAt = e.createdAt;
    dto.updatedAt = e.updatedAt;
    return dto;
  }
}
