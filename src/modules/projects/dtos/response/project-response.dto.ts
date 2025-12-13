import { ProjectEntity } from '../../entities/project.entity';
import { ProjectTranslationResponseDto } from './project-translation-response.dto';
import { ProjectChallengeResponseDto } from './project-challenge-response.dto';
import { ProjectResultResponseDto } from './project-result-response.dto';
import { ServiceResponseDto } from 'src/modules/services/dtos/response/service-response.dto';
import { SolutionResponseDto } from 'src/modules/solutions/dtos/response/solution-response.dto';

export class ProjectResponseDto {
  id: number;
  slug: string;
  icon?: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredImage?: string;
  viewCount: number;
  order: number;
  clientName?: string;
  projectUrl?: string;
  githubUrl?: string;
  startDate?: Date;
  endDate?: Date;
  technologies?: string[];
  // Translatable fields (for merged responses)
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
  services?: ServiceResponseDto[];
  solutions?: SolutionResponseDto[];
  translations?: ProjectTranslationResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ProjectEntity, languageCode?: string): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.icon = entity.icon;
    dto.isPublished = entity.isPublished;
    dto.isFeatured = entity.isFeatured;
    dto.featuredImage = entity.featuredImage;
    dto.viewCount = entity.viewCount;
    dto.order = entity.order;
    dto.clientName = entity.clientName;
    dto.projectUrl = entity.projectUrl;
    dto.githubUrl = entity.githubUrl;
    dto.startDate = entity.startDate;
    dto.endDate = entity.endDate;
    dto.technologies = entity.technologies;
    dto.name = entity.translations?.find((translation) => translation.languageCode === languageCode)?.name;
    dto.description = entity.translations?.find(
      (translation) => translation.languageCode === languageCode,
    )?.description;
    dto.shortDescription = entity.translations?.find(
      (translation) => translation.languageCode === languageCode,
    )?.shortDescription;
    dto.meta = entity.translations?.find((translation) => translation.languageCode === languageCode)?.meta;
    const translation = entity.translations?.find((translation) => translation.languageCode === languageCode);
    dto.challenges = translation?.challenges?.map((challenge) => ProjectChallengeResponseDto.fromEntity(challenge));
    dto.results = translation?.results?.map((result) => ProjectResultResponseDto.fromEntity(result));
    dto.services = entity.services?.map((service) => ServiceResponseDto.fromEntity(service, languageCode));
    dto.solutions = entity.solutions?.map((solution) => SolutionResponseDto.fromEntity(solution, languageCode));
    dto.translations = entity.translations?.map((translation) => ProjectTranslationResponseDto.fromEntity(translation));
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
