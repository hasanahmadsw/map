import { SolutionEntity } from '../../entities/solution.entity';
import { ServiceResponseDto } from 'src/modules/services/dtos/response/service-response.dto';

export class SolutionResponseDto {
  id: number;
  slug: string;
  icon?: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredImage?: string;
  viewCount: number;
  order: number;
  name?: string;
  description?: string;
  shortDescription?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  services?: ServiceResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: SolutionEntity): SolutionResponseDto {
    const dto = new SolutionResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.icon = entity.icon;
    dto.isPublished = entity.isPublished;
    dto.isFeatured = entity.isFeatured;
    dto.featuredImage = entity.featuredImage;
    dto.viewCount = entity.viewCount;
    dto.order = entity.order;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.shortDescription = entity.shortDescription;
    dto.meta = entity.meta;
    dto.services = entity.services?.map((service) => ServiceResponseDto.fromEntity(service));
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
