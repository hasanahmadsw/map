import { SolutionKey } from './solution-key.enum';

export interface SolutionConfig {
  key: SolutionKey;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  shortDescription?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  featuredImage?: string;
}

export const SOLUTIONS_CONFIG: Record<SolutionKey, SolutionConfig> = {
  [SolutionKey.PRODUCTION]: {
    key: SolutionKey.PRODUCTION,
    slug: 'production',
    name: 'Production',
    icon: undefined,
    description: undefined,
    shortDescription: undefined,
    meta: undefined,
    featuredImage: undefined,
  },
  [SolutionKey.EVENTS]: {
    key: SolutionKey.EVENTS,
    slug: 'events',
    name: 'Events',
    icon: undefined,
    description: undefined,
    shortDescription: undefined,
    meta: undefined,
    featuredImage: undefined,
  },
  [SolutionKey.PHOTOGRAPHY]: {
    key: SolutionKey.PHOTOGRAPHY,
    slug: 'photography',
    name: 'Photography',
    icon: undefined,
    description: undefined,
    shortDescription: undefined,
    meta: undefined,
    featuredImage: undefined,
  },
};

export function getSolutionConfig(key: SolutionKey): SolutionConfig | null {
  return SOLUTIONS_CONFIG[key] || null;
}

export function getAllSolutionsConfig(): SolutionConfig[] {
  return Object.values(SOLUTIONS_CONFIG);
}
