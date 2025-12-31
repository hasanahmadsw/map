import { FacilityEntity } from '../../entities/facility.entity';
import { FacilityType } from '../../enums/facility-type.enum';
import { FacilityUnitResponseDto } from './facility-unit-response.dto';

export class FacilityResponseDto {
  id: number;
  solutionId: number;
  type: FacilityType;
  slug: string;
  title?: string;
  summary?: string;
  description?: string;
  coverImage?: string;
  gallery?: any;
  isPublished: boolean;
  viewCount: number;
  order: number;
  units?: FacilityUnitResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(e: FacilityEntity): FacilityResponseDto {
    const dto = new FacilityResponseDto();
    dto.id = e.id;
    dto.solutionId = e.solutionId;
    dto.type = e.type;
    dto.slug = e.slug;
    dto.title = e.title ?? undefined;
    dto.summary = e.summary ?? undefined;
    dto.description = e.description ?? undefined;
    dto.coverImage = e.coverImage ?? undefined;
    dto.gallery = e.gallery ?? undefined;
    dto.isPublished = e.isPublished;
    dto.viewCount = e.viewCount;
    dto.order = e.order;
    dto.units = e.units?.map(FacilityUnitResponseDto.fromEntity);
    dto.createdAt = e.createdAt;
    dto.updatedAt = e.updatedAt;
    return dto;
  }
}
