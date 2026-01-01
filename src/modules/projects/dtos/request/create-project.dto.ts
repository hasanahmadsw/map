import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsArray,
  IsInt,
  IsDateString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectChallengeRequestDto } from './project-challenge-request.dto';
import { ProjectResultRequestDto } from './project-result-request.dto';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  slug: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsOptional()
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProjectChallengeRequestDto)
  challenges?: ProjectChallengeRequestDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProjectResultRequestDto)
  results?: ProjectResultRequestDto[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsUrl()
  @IsOptional()
  projectUrl?: string;

  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  serviceIds?: number[];
}
