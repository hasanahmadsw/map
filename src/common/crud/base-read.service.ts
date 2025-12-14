import { NotFoundException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationService } from '../pagination/paginate.service';
import { PaginationResponseDto } from '../pagination/dto/pagination-response.dto';
import { paginateAuto } from '../db/pagination.helper';
import { ViewCounterService } from '../db/view-counter.service';
import { findByIdOrThrow } from '../db/find-or-throw';

export abstract class BaseReadService<
  Entity extends { id: any; slug: string },
  AdminFilterDto,
  PublicFilterDto,
  ResponseDto,
> {
  protected constructor(
    protected readonly repo: Repository<Entity>,
    protected readonly pagination: PaginationService,
    protected readonly viewCounter: ViewCounterService,
  ) {}

  // hooks
  protected abstract map(entity: Entity): ResponseDto;

  protected abstract createAdminQB(): SelectQueryBuilder<Entity>;
  protected abstract createPublicQB(): SelectQueryBuilder<Entity>;

  protected abstract applyAdminFilters(qb: SelectQueryBuilder<Entity>, dto: AdminFilterDto): void;
  protected abstract applyPublicFilters(qb: SelectQueryBuilder<Entity>, dto: PublicFilterDto): void;

  protected abstract applyDefaultOrdering(qb: SelectQueryBuilder<Entity>, dto?: any): void;

  // should we use safe pagination?
  protected shouldUseSafePagination(_dto: any): boolean {
    return false;
  }

  protected notFoundMessage(): string {
    return 'Resource not found';
  }

  async findAll(dto: AdminFilterDto): Promise<PaginationResponseDto<ResponseDto>> {
    const qb = this.createAdminQB();
    this.applyAdminFilters(qb, dto);
    this.applyDefaultOrdering(qb, dto);

    return paginateAuto(this.pagination, qb, dto, {
      safe: this.shouldUseSafePagination(dto),
      primaryId: `${qb.alias}.id`,
      createdAt: `${qb.alias}.createdAt`,
      map: (e) => this.map(e),
      orderDirection: (dto as any)?.orderDirection ?? 'DESC',
      orderBy: (dto as any)?.orderBy,
    });
  }

  async getById(id: Entity['id'], relations?: string[]): Promise<ResponseDto> {
    const entity = await findByIdOrThrow(this.repo, id, { relations, message: this.notFoundMessage() });
    return this.map(entity);
  }

  async findBySlug(slug: string, relations?: string[]): Promise<ResponseDto> {
    const entity = await this.repo.findOne({ where: { slug } as any, relations });

    if (!entity) throw new NotFoundException(this.notFoundMessage());

    await this.viewCounter.increment(this.repo, entity.id, 'viewCount');
    return this.map(entity);
  }

  async getPublished(dto: PublicFilterDto): Promise<PaginationResponseDto<ResponseDto>> {
    const qb = this.createPublicQB();
    qb.andWhere(`${qb.alias}.isPublished = :isPublished`, { isPublished: true });

    this.applyPublicFilters(qb, dto);
    this.applyDefaultOrdering(qb, dto);

    return paginateAuto(this.pagination, qb, dto, {
      safe: true,
      primaryId: `${qb.alias}.id`,
      createdAt: `${qb.alias}.createdAt`,
      map: (e) => this.map(e),
      orderDirection: (dto as any)?.orderDirection ?? 'DESC',
    });
  }

  async getFeatured(dto: PublicFilterDto): Promise<PaginationResponseDto<ResponseDto>> {
    const qb = this.createPublicQB();
    qb.andWhere(`${qb.alias}.isFeatured = :isFeatured`, { isFeatured: true }).andWhere(
      `${qb.alias}.isPublished = :isPublished`,
      { isPublished: true },
    );

    this.applyPublicFilters(qb, dto);
    this.applyDefaultOrdering(qb, dto);

    return paginateAuto(this.pagination, qb, dto, {
      safe: true,
      primaryId: `${qb.alias}.id`,
      createdAt: `${qb.alias}.createdAt`,
      map: (e) => this.map(e),
      orderDirection: (dto as any)?.orderDirection ?? 'DESC',
    });
  }

  async getBySlugPublic(slug: string): Promise<ResponseDto> {
    const qb = this.createPublicQB();
    qb.where(`${qb.alias}.slug = :slug`, { slug }).andWhere(`${qb.alias}.isPublished = :isPublished`, {
      isPublished: true,
    });

    const entity = await qb.getOne();
    if (!entity) throw new NotFoundException(this.notFoundMessage());

    await this.viewCounter.increment(this.repo, entity.id, 'viewCount');
    return this.map(entity);
  }
}
