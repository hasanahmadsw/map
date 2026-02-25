import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntentEntity } from '../entities/intent.entity';
import { IntentType } from '../types/intent-type.enum';
import {
  IntentPublicResponseDto,
  IntentBreadcrumbItemDto,
  IntentLinkItemDto,
} from '../dtos/response/intent-public-response.dto';
import { IntentResponseDto } from '../dtos/response/intent-response.dto';
import { IntentFilterDto } from '../dtos/query/intent-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { findByIdOrThrow } from 'src/common/db/find-or-throw';
import { paginateAuto } from 'src/common/db/pagination.helper';

const INTENT_BASE_URL = '/equipment-rental';

@Injectable()
export class IntentReadService {
  constructor(
    @InjectRepository(IntentEntity)
    private readonly repo: Repository<IntentEntity>,
    private readonly pagination: PaginationService,
  ) {}

  private getIntentUrl(intent: IntentEntity): string {
    if (intent.type === IntentType.HUB) {
      return INTENT_BASE_URL;
    }
    return `${INTENT_BASE_URL}/${intent.slug}`;
  }

  private toBreadcrumbItem(intent: IntentEntity): IntentBreadcrumbItemDto {
    return {
      slug: intent.slug,
      label: intent.linkLabel || intent.h1 || intent.slug,
      url: this.getIntentUrl(intent),
    };
  }

  private toLinkItem(intent: IntentEntity): IntentLinkItemDto {
    return {
      slug: intent.slug,
      linkLabel: intent.linkLabel || intent.h1 || intent.slug,
      url: this.getIntentUrl(intent),
    };
  }

  async buildBreadcrumbs(intent: IntentEntity): Promise<IntentBreadcrumbItemDto[]> {
    const rows = await this.repo.manager.query<Array<{ id: number; slug: string; type: string; link_label: string | null; h1: string | null }>>(
      `
      WITH RECURSIVE ancestor_chain AS (
        SELECT id, slug, type, parent_id, link_label, h1, 0 AS depth
        FROM intents
        WHERE id = $1
        UNION ALL
        SELECT p.id, p.slug, p.type, p.parent_id, p.link_label, p.h1, ac.depth + 1
        FROM intents p
        INNER JOIN ancestor_chain ac ON p.id = ac.parent_id
      )
      SELECT id, slug, type, link_label, h1 FROM ancestor_chain ORDER BY depth DESC
      `,
      [intent.id],
    );

    return rows.map((row) => ({
      slug: row.slug,
      label: row.link_label || row.h1 || row.slug,
      url: row.type === IntentType.HUB ? INTENT_BASE_URL : `${INTENT_BASE_URL}/${row.slug}`,
    }));
  }

  async buildInternalLinks(intent: IntentEntity): Promise<IntentLinkItemDto[]> {
    const links: IntentLinkItemDto[] = [];

    if (intent.parent) {
      links.push(this.toLinkItem(intent.parent));
    }

    const siblings = await this.repo.find({
      where: { parentId: intent.parentId },
      order: { slug: 'ASC' },
    });
    for (const s of siblings) {
      if (s.id !== intent.id) {
        links.push(this.toLinkItem(s));
      }
    }

    const children = await this.repo.find({
      where: { parentId: intent.id },
      order: { slug: 'ASC' },
    });
    for (const c of children) {
      links.push(this.toLinkItem(c));
    }

    return links;
  }

  async buildSmartBadges(intent: IntentEntity): Promise<IntentLinkItemDto[]> {
    const badges: IntentLinkItemDto[] = [];

    const children = await this.repo.find({
      where: { parentId: intent.id },
      order: { slug: 'ASC' },
    });
    for (const c of children) {
      badges.push(this.toLinkItem(c));
    }

    if (badges.length === 0 && intent.parent) {
      const siblings = await this.repo.find({
        where: { parentId: intent.parentId },
        order: { slug: 'ASC' },
      });
      for (const s of siblings) {
        if (s.id !== intent.id) {
          badges.push(this.toLinkItem(s));
        }
      }
    }

    return badges;
  }

  async getBySlugPublic(slug: string): Promise<IntentPublicResponseDto> {
    const intent = await this.repo.findOne({
      where: { slug },
      relations: ['parent'],
    });
    if (!intent) {
      throw new NotFoundException('Intent not found');
    }
    return this.buildPublicResponse(intent);
  }

  async getHubIntent(): Promise<IntentEntity | null> {
    return this.repo.findOne({
      where: { type: IntentType.HUB },
      relations: ['parent'],
    });
  }

  async getHubPublic(): Promise<IntentPublicResponseDto> {
    const intent = await this.repo.findOne({
      where: { type: IntentType.HUB },
      relations: ['parent'],
    });
    if (!intent) {
      throw new NotFoundException('Hub intent not found');
    }
    return this.buildPublicResponse(intent);
  }

  private async buildPublicResponse(intent: IntentEntity): Promise<IntentPublicResponseDto> {
    const [internalLinks, smartBadges, breadcrumbs] = await Promise.all([
      this.buildInternalLinks(intent),
      this.buildSmartBadges(intent),
      this.buildBreadcrumbs(intent),
    ]);
    const base = IntentResponseDto.fromEntity(intent) as IntentPublicResponseDto;
    base.breadcrumbs = breadcrumbs;
    base.internalLinks = internalLinks;
    base.smartBadges = smartBadges;
    return base;
  }

  async findAll(filter: IntentFilterDto): Promise<PaginationResponseDto<IntentResponseDto>> {
    const qb = this.repo.createQueryBuilder('i').leftJoinAndSelect('i.parent', 'parent');

    if (filter.search) {
      qb.andWhere('(i.slug ILIKE :s OR i.h1 ILIKE :s OR i.linkLabel ILIKE :s)', {
        s: `%${filter.search}%`,
      });
    }

    if (filter.type) {
      qb.andWhere('i.type = :type', { type: filter.type });
    }

    qb.orderBy('i.createdAt', 'DESC');

    return paginateAuto(this.pagination, qb, filter, {
      safe: false,
      primaryId: 'i.id',
      createdAt: 'i.createdAt',
      map: (e) => IntentResponseDto.fromEntity(e),
    });
  }

  async findOne(id: number): Promise<IntentResponseDto> {
    const entity = await findByIdOrThrow(this.repo, id, {
      relations: ['parent'],
      message: 'Intent not found',
    });
    return IntentResponseDto.fromEntity(entity);
  }

  async getTree(): Promise<IntentEntity[]> {
    return this.repo.find({
      where: { parentId: null },
      relations: ['children'],
      order: { slug: 'ASC' },
    });
  }

  /** Public: returns all intent slugs with updatedAt for sitemap generation */
  async getAllSlugsPublic(): Promise<{ slug: string; type: IntentType; updatedAt: string }[]> {
    const intents = await this.repo.find({
      select: ['slug', 'type', 'updatedAt'],
      order: { slug: 'ASC' },
    });
    return intents.map((e) => ({
      slug: e.slug,
      type: e.type,
      updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : new Date().toISOString(),
    }));
  }
}
