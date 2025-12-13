import { ArticleEntity } from '../../entities/article.entity';
import { ArticleTranslationResponseDto } from './article-translation-response.dto';
import { StaffResponseDto } from 'src/modules/staff/dtos/response/staff-response.dto';

export class ArticleResponseDto {
  id: number;
  slug: string;
  image?: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredImage?: string;
  viewCount: number;
  // Translatable fields (for merged responses)
  name?: string;
  content?: string;
  excerpt?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  tags?: string[];
  topics?: string[];
  author?: StaffResponseDto;
  translations?: ArticleTranslationResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ArticleEntity, languageCode?: string): ArticleResponseDto {
    const dto = new ArticleResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.image = entity.image;
    dto.isPublished = entity.isPublished;
    dto.isFeatured = entity.isFeatured;
    dto.viewCount = entity.viewCount;
    dto.tags = entity.tags;
    dto.topics = entity.topics;
    dto.name = entity.translations?.find((translation) => translation.languageCode === languageCode)?.name;
    dto.content = entity.translations?.find((translation) => translation.languageCode === languageCode)?.content;
    dto.excerpt = entity.translations?.find((translation) => translation.languageCode === languageCode)?.excerpt;
    dto.meta = entity.translations?.find((translation) => translation.languageCode === languageCode)?.meta;
    dto.author = entity.author ? StaffResponseDto.fromEntity(entity.author) : undefined;
    dto.translations = entity.translations?.map((translation) => ArticleTranslationResponseDto.fromEntity(translation));
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
