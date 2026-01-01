import { Injectable, Global } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { PaginationResponseDto } from './dto/pagination-response.dto';
export type PaginationArgs = Partial<PaginationDto>;
import { PaginationDto } from './dto/pagination.dto';

@Global()
@Injectable()
export class PaginationService {
  constructor(private readonly config: { maxLimit?: number } = { maxLimit: 1000 }) {}

  sanitize(dto: PaginationArgs) {
    const page = Math.max(dto.page ?? 1, 1);
    const limit = Math.min(Math.max(dto.limit ?? 10, 1), this.config.maxLimit ?? 100);
    const orderDirection: 'ASC' | 'DESC' = dto.orderDirection ?? 'DESC';
    return { page, limit, orderDirection };
  }

  // paginate normal
  async paginateQB<Entity extends ObjectLiteral, Out = Entity>(
    qb: SelectQueryBuilder<Entity>,
    args: PaginationArgs,
    options?: {
      orderBy?: `${string}.${string}`;
      map?: (e: Entity) => Out;
    },
  ): Promise<PaginationResponseDto<Out>> {
    const { page, limit, orderDirection } = this.sanitize(args);
    const skip = (page - 1) * limit;

    const alias = qb.alias;
    const orderBy = options?.orderBy ?? `${alias}.createdAt`;

    // check if the qb has a predefined order
    const hasPredefinedOrder = qb.expressionMap && Object.keys(qb.expressionMap.orderBys ?? {}).length > 0;

    if (!hasPredefinedOrder) {
      qb.orderBy(orderBy, orderDirection);
    }

    // calculate total without ORDER BY (faster + no need for it in the count)
    const countQb = qb.clone();
    // TypeORM automatically removes order in getCount, but we keep it clear:
    // (some versions/drivers keep order)
    (countQb as any).expressionMap.orderBys = {};
    const totalResult = await countQb.getCount();

    const rows = await qb.skip(skip).take(limit).getMany();
    const data = options?.map ? rows.map(options.map) : (rows as unknown as Out[]);

    return new PaginationResponseDto<Out>(data, totalResult, page, limit);
  }

  // paginateSafe solves the problem of row duplication with INNER JOIN
  async paginateSafeQB<Entity extends ObjectLiteral, Out = Entity>(
    qb: SelectQueryBuilder<Entity>,
    args: PaginationArgs,
    options?: {
      primaryId?: `${string}.id`;
      createdAt?: `${string}.created_at` | `${string}.createdAt`;
      map?: (e: Entity) => Out;
      orderDirection?: 'ASC' | 'DESC';
    },
  ): Promise<PaginationResponseDto<Out>> {
    const { page, limit, orderDirection } = this.sanitize({
      ...args,
      orderDirection: options?.orderDirection ?? 'DESC',
    });
    const skip = (page - 1) * limit;

    const alias = qb.alias;
    const idCol = options?.primaryId ?? `${alias}.id`;

    // we select created_at if it exists, otherwise createdAt
    const createdCol = options?.createdAt
      ? options.createdAt
      : (await this.columnExists(qb, `${alias}.created_at`))
        ? `${alias}.created_at`
        : `${alias}.createdAt`;

    // Check if the query builder has predefined ordering
    const hasPredefinedOrder = qb.expressionMap && Object.keys(qb.expressionMap.orderBys ?? {}).length > 0;

    // 1) IDs page (with DISTINCT)
    let ids: number[];

    if (hasPredefinedOrder) {
      // Preserve the original ordering from the query builder
      // Fetch all IDs in order, deduplicate, then apply pagination
      // This ensures correct pagination across pages
      const orderedQb = qb.clone();
      orderedQb.select(`${idCol}`, 'id');

      // Fetch all ordered IDs (may have duplicates from JOINs)
      const allOrderedIdsRaw = await orderedQb.getRawMany<{ id: number }>();

      // Remove duplicates while preserving order
      const seen = new Set<number>();
      const uniqueIds: number[] = [];
      for (const row of allOrderedIdsRaw) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          uniqueIds.push(row.id);
        }
      }

      // Apply pagination to deduplicated list
      const startIndex = skip;
      const endIndex = skip + limit;
      ids = uniqueIds.slice(startIndex, endIndex);
    } else {
      // No predefined ordering - use default behavior without JOINs
      const idQ = qb.clone();
      // Clear existing selections, ordering, and JOINs
      (idQ as any).expressionMap.selects = [];
      (idQ as any).expressionMap.orderBys = {};
      (idQ as any).expressionMap.joinAttributes = [];

      idQ
        .select(`${idCol}`, 'id')
        .addSelect(`${createdCol}`, 'created_at_for_order')
        .orderBy(createdCol, orderDirection)
        .addOrderBy(idCol, 'ASC')
        .skip(skip)
        .take(limit);

      const idsRaw = await idQ.getRawMany<{ id: number }>();
      ids = idsRaw.map((r) => r.id);
    }

    // 2) total (with COUNT DISTINCT) - remove ORDER BY for count query
    const totalQ = qb.clone().select(`COUNT(DISTINCT ${idCol})`, 'count');
    totalQ.orderBy(''); // Remove ORDER BY for count query
    const totalRes = await totalQ.getRawOne<{ count: string }>();
    const total = parseInt(totalRes?.count ?? '0', 10);

    if (!ids.length) {
      return new PaginationResponseDto<Out>([], total, page, limit);
    }

    // 3) fetch page entities fully
    const dataQb = qb.clone();

    if (hasPredefinedOrder) {
      // Preserve the original ordering - don't clear it
      // The ordering is already set in the query builder
      const dataRows = await dataQb.andWhereInIds(ids).getMany();

      // Sort the results to match the original ordering
      // Since databases don't guarantee order with IN clause, we sort in memory
      const idToIndex = new Map(ids.map((id, idx) => [id, idx]));
      dataRows.sort((a, b) => {
        const aIdx = idToIndex.get((a as any).id) ?? Infinity;
        const bIdx = idToIndex.get((b as any).id) ?? Infinity;
        return aIdx - bIdx;
      });

      const data = options?.map ? dataRows.map(options.map) : (dataRows as unknown as Out[]);
      return new PaginationResponseDto<Out>(data, total, page, limit);
    } else {
      // Clear any existing ordering before applying new ordering
      (dataQb as any).expressionMap.orderBys = {};
      const dataRows = await dataQb
        .andWhereInIds(ids)
        .orderBy(createdCol, orderDirection)
        .addOrderBy(idCol, 'ASC')
        .getMany();

      const data = options?.map ? dataRows.map(options.map) : (dataRows as unknown as Out[]);
      return new PaginationResponseDto<Out>(data, total, page, limit);
    }
  }

  // paginate for an array in memory (if needed)
  paginateArray<T>(items: T[], args: PaginationArgs): PaginationResponseDto<T> {
    const { page, limit } = this.sanitize(args);
    const start = (page - 1) * limit;
    const end = start + limit;
    const slice = items.slice(start, end);
    return new PaginationResponseDto<T>(slice, items.length, page, limit);
  }

  // check if column exists (for created_at/createdAt)
  private async columnExists<Entity extends ObjectLiteral>(
    qb: SelectQueryBuilder<Entity>,
    fullCol: string,
  ): Promise<boolean> {
    try {
      await qb.clone().orderBy(fullCol, 'DESC').take(1).getMany();
      return true;
    } catch {
      return false;
    }
  }
}
