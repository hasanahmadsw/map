import { ArticleTranslationEntity } from '../../entities/article-translation.entity';
import { LanguageEntity } from '../../../languages/entities/language.entity';

export class ArticleTranslationResponseDto {
  id: number;
  articleId: number;
  languageCode: string;
  name?: string;
  content?: string;
  excerpt?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  language?: LanguageEntity;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ArticleTranslationEntity): ArticleTranslationResponseDto {
    const dto = new ArticleTranslationResponseDto();
    dto.id = entity.id;
    dto.articleId = entity.articleId;
    dto.languageCode = entity.languageCode;
    dto.name = entity.name;
    dto.content = entity.content;
    dto.excerpt = entity.excerpt;
    dto.meta = entity.meta;
    dto.language = entity.language;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
