import { Injectable } from '@nestjs/common';

import { ArticlesReadService } from './articles-read.service';
import { ArticlesCrudService } from './articles-crud.service';

import { CreateArticleDto } from '../dtos/request/create-article.dto';
import { UpdateArticleDto } from '../dtos/request/update-article.dto';
import { ArticleResponseDto } from '../dtos/response/article-response.dto';
import { ArticleFilterDto } from '../dtos/query/article-filter.dto';
import { PublicArticleFilterDto } from '../dtos/query/public-article-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { StaffEntity } from 'src/modules/staff/entities/staff.entity';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly read: ArticlesReadService,
    private readonly crud: ArticlesCrudService,
  ) {}

  async create(author: StaffEntity, dto: CreateArticleDto): Promise<ArticleResponseDto> {
    const saved = await this.crud.createWithAuthor(author, dto);
    return this.read.getById(saved.id, ['author']);
  }

  findAll(dto: ArticleFilterDto): Promise<PaginationResponseDto<ArticleResponseDto>> {
    return this.read.findAll(dto);
  }

  getById(id: number): Promise<ArticleResponseDto> {
    return this.read.getById(id, ['author']);
  }

  findBySlug(slug: string): Promise<ArticleResponseDto> {
    return this.read.findBySlug(slug, ['author']);
  }

  findRelatedArticles(slug: string): Promise<ArticleResponseDto[]> {
    return this.read.findRelatedArticles(slug);
  }

  async update(id: number, author: StaffEntity, dto: UpdateArticleDto): Promise<ArticleResponseDto> {
    const saved = await this.crud.updateWithAuthor(id, author, dto);
    return this.read.getById(saved.id, ['author']);
  }

  delete(id: number, author: StaffEntity): Promise<void> {
    return this.crud.deleteWithAuthor(id, author);
  }

  async publish(id: number, author: StaffEntity): Promise<ArticleResponseDto> {
    const saved = await this.crud.publishWithAuthor(id, author);
    return this.read.getById(saved.id, ['author']);
  }

  async unpublish(id: number, author: StaffEntity): Promise<ArticleResponseDto> {
    const saved = await this.crud.unpublishWithAuthor(id, author);
    return this.read.getById(saved.id, ['author']);
  }

  async toggleFeatured(id: number, author: StaffEntity): Promise<ArticleResponseDto> {
    const saved = await this.crud.toggleFeaturedWithAuthor(id, author);
    return this.read.getById(saved.id, ['author']);
  }

  getPublishedArticles(dto: PublicArticleFilterDto) {
    return this.read.getPublished(dto);
  }

  getFeaturedArticles(dto: PublicArticleFilterDto) {
    return this.read.getFeatured(dto);
  }

  getBySlugPublic(slug: string) {
    return this.read.getBySlugPublic(slug);
  }
}
