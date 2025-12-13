import { LanguageEntity } from '../../../languages/entities/language.entity';
import { ServiceTranslationEntity } from '../../entities/service-translation.entity';
import { SubServiceResponseDto } from './sub-service-response.dto';

export class ServiceTranslationResponseDto {
  id: number;
  serviceId: number;

  languageCode: string;
  name?: string;

  description?: string;
  shortDescription?: string;

  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  subServices?: SubServiceResponseDto[];
  language: LanguageEntity;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ServiceTranslationEntity): ServiceTranslationResponseDto {
    const dto = new ServiceTranslationResponseDto();
    dto.id = entity.id;
    dto.serviceId = entity.serviceId;
    dto.languageCode = entity.languageCode;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.shortDescription = entity.shortDescription;
    dto.meta = entity.meta;
    dto.subServices = entity.subServices?.map((subService) => SubServiceResponseDto.fromEntity(subService));
    dto.language = entity.language;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
