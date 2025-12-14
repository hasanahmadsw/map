import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add missing indexes for projects table
 * - GIN index on client_name for ILIKE searches (used in findAll and getPublishedProjects)
 * - Composite index for is_published AND is_featured (used in getFeaturedProjects)
 */
export class AddMissingProjectIndexes1765662190095 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- =========================
      -- projects table indexes
      -- =========================

      -- GIN index on client_name for ILIKE searches (used in findAll and getPublishedProjects with clientName filter)
      -- This significantly improves performance for pattern matching queries
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_projects_client_name_trgm
        ON public.projects USING gin (client_name gin_trgm_ops);

      -- Composite index for queries filtering by both is_published AND is_featured
      -- Used by: getFeaturedProjects() which filters by both conditions
      CREATE INDEX IF NOT EXISTS idx_projects_published_featured_order_created
        ON public.projects (is_published, is_featured, "order" ASC, created_at DESC, id ASC)
        WHERE is_published = true AND is_featured = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_projects_published_featured_order_created;
      DROP INDEX IF EXISTS idx_projects_client_name_trgm;
    `);
  }
}

