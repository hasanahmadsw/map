import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { ArticleEntity } from '../entities/article.entity';
import { ArticleResponseDto } from '../dtos/response/article-response.dto';
import { ArticleFilterDto } from '../dtos/query/article-filter.dto';
import { PublicArticleFilterDto } from '../dtos/query/public-article-filter.dto';

import { PaginationService } from 'src/common/pagination/paginate.service';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { BaseReadService } from 'src/common/crud/base-read.service';

@Injectable()
export class ArticlesReadService extends BaseReadService<
  ArticleEntity,
  ArticleFilterDto,
  PublicArticleFilterDto,
  ArticleResponseDto
> {
  constructor(
    @InjectRepository(ArticleEntity) repo: Repository<ArticleEntity>,
    pagination: PaginationService,
    viewCounter: ViewCounterService,
  ) {
    super(repo, pagination, viewCounter);
  }

  protected map(entity: ArticleEntity): ArticleResponseDto {
    return ArticleResponseDto.fromEntity(entity);
  }

  protected notFoundMessage(): string {
    return 'Article not found';
  }

  protected createAdminQB(): SelectQueryBuilder<ArticleEntity> {
    return this.repo.createQueryBuilder('article').leftJoinAndSelect('article.author', 'author');
  }

  protected createPublicQB(): SelectQueryBuilder<ArticleEntity> {
    return this.repo.createQueryBuilder('article').leftJoinAndSelect('article.author', 'author');
  }

  protected shouldUseSafePagination(_dto: any): boolean {
    return true; // because we have JOINs
  }

  protected applyAdminFilters(qb: SelectQueryBuilder<ArticleEntity>, filter: ArticleFilterDto): void {
    if (filter.search) {
      qb.andWhere('(article.slug ILIKE :search OR article.name ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.slug) {
      qb.andWhere('article.slug = :slug', { slug: filter.slug });
    }
    if (filter.isPublished !== undefined) {
      qb.andWhere('article.isPublished = :isPublished', { isPublished: filter.isPublished });
    }
    if (filter.isFeatured !== undefined) {
      qb.andWhere('article.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }
    if (filter.tag) {
      qb.andWhere('article.tags @> :tag', { tag: [filter.tag] });
    }
    if (filter.topic) {
      qb.andWhere('article.topics @> :topic', { topic: [filter.topic] });
    }
  }

  protected applyPublicFilters(qb: SelectQueryBuilder<ArticleEntity>, filter: PublicArticleFilterDto): void {
    if (!filter) return;

    if (filter.search) {
      qb.andWhere('(article.name ILIKE :search OR article.content ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.isFeatured !== undefined) {
      qb.andWhere('article.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }
    if (filter.tag) {
      qb.andWhere('article.tags @> :tag', { tag: [filter.tag] });
    }
    if (filter.topic) {
      qb.andWhere('article.topics @> :topic', { topic: [filter.topic] });
    }
  }

  protected applyDefaultOrdering(qb: SelectQueryBuilder<ArticleEntity>): void {
    qb.orderBy('article.createdAt', 'DESC');
  }

  async findRelatedArticles(slug: string): Promise<ArticleResponseDto[]> {
    const article = await this.repo.findOne({
      where: { slug },
    });
    if (!article) throw new NotFoundException('Article not found');

    const articleTopics = article.topics || [];

    const qb = this.createPublicQB()
      .where('article.id != :id', { id: article.id })
      .andWhere('article.isPublished = :isPublished', { isPublished: true });

    // Find articles that share at least one topic
    if (articleTopics.length > 0) {
      qb.andWhere('article.topics && :topics', { topics: articleTopics });
    }

    qb.orderBy('article.createdAt', 'DESC').take(10);

    const articles = await qb.getMany();
    return articles.map((article) => this.map(article));
  }
}
