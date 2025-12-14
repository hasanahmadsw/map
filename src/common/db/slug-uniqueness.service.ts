import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class SlugUniquenessService {
  async assertUnique<T extends { id: any; slug: string }>(
    repo: Repository<T>,
    slug: string,
    opts?: { excludeId?: T['id']; message?: string },
  ): Promise<void> {
    const qb = repo.createQueryBuilder('e').select('e.id').where('e.slug = :slug', { slug });

    if (opts?.excludeId !== undefined) {
      qb.andWhere('e.id != :excludeId', { excludeId: opts.excludeId });
    }

    const exists = await qb.getOne();
    if (exists) throw new ConflictException(opts?.message ?? 'Slug already exists');
  }
}
