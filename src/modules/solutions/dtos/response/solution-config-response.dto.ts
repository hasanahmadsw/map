import { SolutionConfig } from '../../solutions.config';
import { SolutionKey } from '../../solution-key.enum';

export class SolutionConfigResponseDto {
  key: SolutionKey;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  shortDescription?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  featuredImage?: string;

  static fromConfig(config: SolutionConfig): SolutionConfigResponseDto {
    const dto = new SolutionConfigResponseDto();
    dto.key = config.key;
    dto.slug = config.slug;
    dto.name = config.name;
    dto.icon = config.icon;
    dto.description = config.description;
    dto.shortDescription = config.shortDescription;
    dto.meta = config.meta;
    dto.featuredImage = config.featuredImage;
    return dto;
  }
}
