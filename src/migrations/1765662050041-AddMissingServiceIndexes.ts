import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add missing indexes for services table
 * - GIN index on slug for ILIKE searches (used in findAll)
 * - Composite index for is_published AND is_featured (used in getFeaturedServices)
 */
export class AddMissingServiceIndexes1765662050041 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- =========================
      -- services table indexes
      -- =========================

      -- GIN index on slug for ILIKE searches (used in findAll with search filter)
      -- This significantly improves performance for pattern matching queries
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_services_slug_trgm
        ON public.services USING gin (slug gin_trgm_ops);

      -- Composite index for queries filtering by both is_published AND is_featured
      -- Used by: getFeaturedServices() which filters by both conditions
      CREATE INDEX IF NOT EXISTS idx_services_published_featured_order_created
        ON public.services (is_published, is_featured, "order" ASC, created_at DESC, id ASC)
        WHERE is_published = true AND is_featured = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_services_published_featured_order_created;
      DROP INDEX IF EXISTS idx_services_slug_trgm;
    `);
  }
}

