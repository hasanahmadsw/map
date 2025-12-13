import { SolutionEntity } from '../../entities/solution.entity';
import { SolutionTranslationResponseDto } from './solution-translation-response.dto';
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
  translations?: SolutionTranslationResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: SolutionEntity, languageCode?: string): SolutionResponseDto {
    const dto = new SolutionResponseDto();
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
    dto.services = entity.services?.map((service) => ServiceResponseDto.fromEntity(service, languageCode));
    dto.translations = entity.translations?.map((translation) =>
      SolutionTranslationResponseDto.fromEntity(translation),
    );
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
