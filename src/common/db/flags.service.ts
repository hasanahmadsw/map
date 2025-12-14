import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { findByIdOrThrow } from './find-or-throw';

@Injectable()
export class FlagsService {
  async setFlag<T extends { id: any }>(
    repo: Repository<T>,
    id: T['id'],
    flag: keyof T,
    value: any,
    notFoundMessage?: string,
  ): Promise<T> {
    const entity = await findByIdOrThrow(repo, id, { message: notFoundMessage ?? 'Resource not found' });
    (entity as any)[flag] = value;
    return repo.save(entity);
  }

  async toggleFlag<T extends { id: any }>(
    repo: Repository<T>,
    id: T['id'],
    flag: keyof T,
    notFoundMessage?: string,
  ): Promise<T> {
    const entity = await findByIdOrThrow(repo, id, { message: notFoundMessage ?? 'Resource not found' });
    (entity as any)[flag] = !(entity as any)[flag];
    return repo.save(entity);
  }
}
