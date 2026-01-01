import { ServiceEntity } from '../../entities/service.entity';
import { SubServiceResponseDto } from './sub-service-response.dto';
import { SolutionKey } from 'src/modules/solutions/solution-key.enum';

export class ServiceResponseDto {
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
  subServices?: SubServiceResponseDto[];
  solutionKey?: SolutionKey;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ServiceEntity): ServiceResponseDto {
    const dto = new ServiceResponseDto();
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
    dto.subServices = entity.subServices?.map((subService) => SubServiceResponseDto.fromEntity(subService));
    dto.solutionKey = entity.solutionKey;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
