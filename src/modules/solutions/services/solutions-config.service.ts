import { Injectable } from '@nestjs/common';
import { SolutionKey } from '../solution-key.enum';
import { SolutionConfig, getAllSolutionsConfig, getSolutionConfig } from '../solutions.config';

@Injectable()
export class SolutionsConfigService {
  getAll(): SolutionConfig[] {
    return getAllSolutionsConfig();
  }

  getByKey(key: SolutionKey): SolutionConfig | null {
    return getSolutionConfig(key);
  }
}
