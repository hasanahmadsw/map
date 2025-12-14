import { NotFoundException } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';

export async function findByIdOrThrow<T extends { id: any }>(
  repo: Repository<T>,
  id: T['id'],
  options?: Omit<FindOneOptions<T>, 'where'> & { message?: string },
): Promise<T> {
  const entity = await repo.findOne({
    ...(options ?? {}),
    where: { id } as any,
  });

  if (!entity) throw new NotFoundException(options?.message ?? 'Resource not found');
  return entity;
}
