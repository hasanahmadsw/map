import { LanguageEntity } from '../../../languages/entities/language.entity';
import { SolutionTranslationEntity } from '../../entities/solution-translation.entity';

export class SolutionTranslationResponseDto {
  id: number;
  solutionId: number;

  languageCode: string;
  name?: string;

  description?: string;
  shortDescription?: string;

  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  language: LanguageEntity;
  createdAt: Date;
  updatedAt: Date;
  static fromEntity(entity: SolutionTranslationEntity): SolutionTranslationResponseDto {
    const dto = new SolutionTranslationResponseDto();
    dto.id = entity.id;
    dto.solutionId = entity.solutionId;
    dto.languageCode = entity.languageCode;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.shortDescription = entity.shortDescription;
    dto.meta = entity.meta;
    dto.language = entity.language;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
