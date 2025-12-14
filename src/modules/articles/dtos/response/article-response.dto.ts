import { ArticleEntity } from '../../entities/article.entity';
import { StaffResponseDto } from 'src/modules/staff/dtos/response/staff-response.dto';

export class ArticleResponseDto {
  id: number;
  slug: string;
  image?: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredImage?: string;
  viewCount: number;
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
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ArticleEntity): ArticleResponseDto {
    const dto = new ArticleResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.image = entity.image;
    dto.isPublished = entity.isPublished;
    dto.isFeatured = entity.isFeatured;
    dto.viewCount = entity.viewCount;
    dto.tags = entity.tags;
    dto.topics = entity.topics;
    dto.name = entity.name;
    dto.content = entity.content;
    dto.excerpt = entity.excerpt;
    dto.meta = entity.meta;
    dto.author = entity.author ? StaffResponseDto.fromEntity(entity.author) : undefined;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
