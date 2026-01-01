import { ProjectEntity } from '../../entities/project.entity';
import { ProjectChallengeResponseDto } from './project-challenge-response.dto';
import { ProjectResultResponseDto } from './project-result-response.dto';
import { ServiceResponseDto } from 'src/modules/services/dtos/response/service-response.dto';

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
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ProjectEntity): ProjectResponseDto {
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
    dto.name = entity.name;
    dto.description = entity.description;
    dto.shortDescription = entity.shortDescription;
    dto.meta = entity.meta;
    dto.challenges = entity.challenges?.map((challenge) => ProjectChallengeResponseDto.fromEntity(challenge));
    dto.results = entity.results?.map((result) => ProjectResultResponseDto.fromEntity(result));
    dto.services = entity.services?.map((service) => ServiceResponseDto.fromEntity(service));
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
