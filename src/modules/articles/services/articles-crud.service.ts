import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ArticleEntity } from '../entities/article.entity';
import { CreateArticleDto } from '../dtos/request/create-article.dto';
import { UpdateArticleDto } from '../dtos/request/update-article.dto';
import { StaffEntity } from '../../staff/entities/staff.entity';
import { StaffRole } from '../../staff/enums/staff-role.enums';

import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { FlagsService } from 'src/common/db/flags.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';

@Injectable()
export class ArticlesCrudService extends BaseCrudService<ArticleEntity, CreateArticleDto, UpdateArticleDto> {
  constructor(
    @InjectRepository(ArticleEntity) repo: Repository<ArticleEntity>,
    dataSource: DataSource,
    slugGuard: SlugUniquenessService,
    flags: FlagsService,
  ) {
    super(repo, dataSource, slugGuard, flags);
  }

  protected notFoundMessage(): string {
    return 'Article not found';
  }

  protected createEntityPayload(dto: CreateArticleDto): Partial<ArticleEntity> {
    const { tags, topics, name, content, excerpt, meta, ...articleData } = dto;

    return {
      slug: articleData.slug,
      isPublished: articleData.isPublished ?? false,
      isFeatured: articleData.isFeatured ?? false,
      viewCount: 0,
      image: articleData.image,
      tags: tags ?? [],
      topics: topics ?? [],
      name,
      content,
      excerpt: excerpt ?? null,
      meta: meta ?? null,
    };
  }

  protected updateEntityPayload(entity: ArticleEntity, dto: UpdateArticleDto): void {
    const { tags, topics, ...articleData } = dto;

    Object.assign(entity, articleData);

    // Handle tags if provided
    if (tags !== undefined) {
      entity.tags = tags || [];
    }

    // Handle topics if provided
    if (topics !== undefined) {
      entity.topics = topics || [];
    }
  }

  async createWithAuthor(author: StaffEntity, dto: CreateArticleDto): Promise<ArticleEntity> {
    const slug = dto.slug;
    await this.slugGuard.assertUnique(this.repo as any, slug);

    return this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(this.repo.target as any) as Repository<ArticleEntity>;
      const payload = { ...this.createEntityPayload(dto), authorId: author.id };
      const entity = repo.create(payload);
      const saved = (await repo.save(entity)) as ArticleEntity;

      await this.attachRelationsOnCreate(saved, dto, em);
      return saved;
    });
  }

  async updateWithAuthor(id: ArticleEntity['id'], author: StaffEntity, dto: UpdateArticleDto): Promise<ArticleEntity> {
    await this.findArticleAndValidateOwnership(id, author);
    return this.update(id, dto);
  }

  async deleteWithAuthor(id: ArticleEntity['id'], author: StaffEntity): Promise<void> {
    await this.findArticleAndValidateOwnership(id, author);
    return this.delete(id);
  }

  async publishWithAuthor(id: ArticleEntity['id'], author: StaffEntity): Promise<ArticleEntity> {
    await this.findArticleAndValidateOwnership(id, author);
    return super.publish(id);
  }

  async unpublishWithAuthor(id: ArticleEntity['id'], author: StaffEntity): Promise<ArticleEntity> {
    await this.findArticleAndValidateOwnership(id, author);
    return super.unpublish(id);
  }

  async toggleFeaturedWithAuthor(id: ArticleEntity['id'], author: StaffEntity): Promise<ArticleEntity> {
    await this.findArticleAndValidateOwnership(id, author);
    return super.toggleFeatured(id);
  }

  /**
   * Finds an article and validates ownership (allows superadmin to access any article)
   */
  private async findArticleAndValidateOwnership(id: number, author: StaffEntity): Promise<ArticleEntity> {
    const article = await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });

    // Allow superadmin to update any article, otherwise check ownership
    if (article.authorId !== author.id && author.role !== StaffRole.SUPERADMIN) {
      throw new ForbiddenException('You are not the author of this article');
    }

    return article;
  }
}
