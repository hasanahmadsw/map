import { BroadcastUnitEntity } from '../../entities/broadcast-unit.entity';
import { BroadcastUnitItemGroup } from '../../enums/broadcast-unit-item.enum';
import { BroadcastType } from '../../enums/broadcast-type.enum';

export class BroadcastUnitItemResponseDto {
  group?: BroadcastUnitItemGroup; // e.g. BroadcastUnitItemGroup.CAMERAS
  title: string; // itemTitle
  qty?: number; // quantity
  notes?: string;
  order?: number;
}

export class BroadcastUnitSpecsResponseDto {
  format?: string;
  routing?: string;
  intercom?: string;
  intercomList?: string[];
  useCases?: string[];
  audioMixer?: string;
  visionMixer?: string;
  visionMixers?: string[];
  cameraChains?: number;
  cameraSystem?: string;
  powerBackup?: string;
  power?: string;
  mobility?: string;
  deployment?: string;
}

export class BroadcastUnitResponseDto {
  id: number;
  type: BroadcastType;
  slug: string;
  title?: string;
  summary?: string;
  description?: string;
  specs?: BroadcastUnitSpecsResponseDto;
  coverImage?: string;
  gallery?: any;
  isPublished: boolean;
  viewCount: number;
  order: number;
  items?: BroadcastUnitItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(e: BroadcastUnitEntity): BroadcastUnitResponseDto {
    const dto = new BroadcastUnitResponseDto();
    dto.id = e.id;
    dto.type = e.type;
    dto.slug = e.slug;
    dto.title = e.title ?? undefined;
    dto.summary = e.summary ?? undefined;
    dto.description = e.description ?? undefined;
    dto.specs = e.specs ? Object.assign(new BroadcastUnitSpecsResponseDto(), e.specs) : undefined;
    dto.coverImage = e.coverImage ?? undefined;
    dto.gallery = e.gallery ?? undefined;
    dto.isPublished = e.isPublished;
    dto.viewCount = e.viewCount;
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
