import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class ViewCounterService {
  async increment<T extends { id: any }>(repo: Repository<T>, id: T['id'], column: string = 'viewCount') {
    // Atomic increment (race-condition safe)
    await repo.increment({ id } as any, column, 1);
  }
}
