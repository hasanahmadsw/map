import { LanguageEntity } from '../../../languages/entities/language.entity';
import { ProjectTranslationEntity } from '../../entities/project-translation.entity';
import { ProjectChallengeResponseDto } from './project-challenge-response.dto';
import { ProjectResultResponseDto } from './project-result-response.dto';

export class ProjectTranslationResponseDto {
  id: number;
  projectId: number;
  languageCode: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  challenges?: ProjectChallengeResponseDto[];
  results?: ProjectResultResponseDto[];
  language: LanguageEntity;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ProjectTranslationEntity): ProjectTranslationResponseDto {
    const dto = new ProjectTranslationResponseDto();
    dto.id = entity.id;
    dto.projectId = entity.projectId;
    dto.languageCode = entity.languageCode;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.shortDescription = entity.shortDescription;
    dto.meta = entity.meta;
    dto.challenges = entity.challenges?.map((challenge) => ProjectChallengeResponseDto.fromEntity(challenge));
    dto.results = entity.results?.map((result) => ProjectResultResponseDto.fromEntity(result));
    dto.language = entity.language;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
