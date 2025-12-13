import { ServiceEntity } from '../../entities/service.entity';
import { ServiceTranslationResponseDto } from './service-translation-response.dto';
import { SubServiceResponseDto } from './sub-service-response.dto';
import { SolutionResponseDto } from 'src/modules/solutions/dtos/response/solution-response.dto';

export class ServiceResponseDto {
  id: number;
  slug: string;
  icon?: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredImage?: string;
  viewCount: number;
  order: number;
  // Translatable fields (for merged responses)
  name?: string;
  description?: string;
  shortDescription?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  subServices?: SubServiceResponseDto[];
  translations?: ServiceTranslationResponseDto[];
  solutions?: SolutionResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ServiceEntity, languageCode?: string): ServiceResponseDto {
    const dto = new ServiceResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.icon = entity.icon;
    dto.isPublished = entity.isPublished;
    dto.isFeatured = entity.isFeatured;
    dto.featuredImage = entity.featuredImage;
    dto.viewCount = entity.viewCount;
    dto.order = entity.order;
    dto.name = entity.translations?.find((translation) => translation.languageCode === languageCode)?.name;
    dto.description = entity.translations?.find(
      (translation) => translation.languageCode === languageCode,
    )?.description;
    dto.shortDescription = entity.translations?.find(
      (translation) => translation.languageCode === languageCode,
    )?.shortDescription;
    dto.meta = entity.translations?.find((translation) => translation.languageCode === languageCode)?.meta;
    const translation = entity.translations?.find((translation) => translation.languageCode === languageCode);
    dto.subServices = translation?.subServices?.map((subService) => SubServiceResponseDto.fromEntity(subService));
    dto.translations = entity.translations?.map((translation) => ServiceTranslationResponseDto.fromEntity(translation));
    dto.solutions = entity.solutions?.map((solution) => SolutionResponseDto.fromEntity(solution, languageCode || ''));
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
