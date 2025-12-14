import { SelectQueryBuilder } from 'typeorm';
import { PaginationService } from '../pagination/paginate.service';
import { PaginationResponseDto } from '../pagination/dto/pagination-response.dto';

export async function paginateAuto<T, Dto, R>(
  pagination: PaginationService,
  qb: SelectQueryBuilder<T>,
  dto: any,
  opts: {
    safe?: boolean;
    primaryId?: `${string}.id`;
    createdAt?: `${string}.created_at` | `${string}.createdAt`;
    orderBy?: `${string}.${string}`;
    orderDirection?: 'ASC' | 'DESC';
    map: (e: T) => R;
  },
): Promise<PaginationResponseDto<R>> {
  const safe = !!opts.safe;
  const alias = qb.alias;

  if (safe) {
    return pagination.paginateSafeQB(qb as any, dto, {
      primaryId: opts.primaryId ?? (`${alias}.id` as `${string}.id`),
      createdAt: opts.createdAt ?? (`${alias}.createdAt` as `${string}.createdAt`),
      orderDirection: opts.orderDirection ?? 'DESC',
      map: opts.map as any,
    });
  }

  return pagination.paginateQB(qb as any, dto, {
    orderBy: opts.orderBy ?? (`${alias}.createdAt` as `${string}.${string}`),
    map: opts.map as any,
  });
}
