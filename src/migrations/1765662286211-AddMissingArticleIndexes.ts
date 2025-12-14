import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add missing indexes for articles table
 * - GIN index on slug for ILIKE searches (used in findAll)
 * - Composite index for is_published AND is_featured (used in getFeaturedArticles)
 */
export class AddMissingArticleIndexes1765662286211 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- =========================
      -- articles table indexes
      -- =========================

      -- GIN index on slug for ILIKE searches (used in findAll with search filter)
      -- This significantly improves performance for pattern matching queries
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_articles_slug_trgm
        ON public.articles USING gin (slug gin_trgm_ops);

      -- Composite index for queries filtering by both is_published AND is_featured
      -- Used by: getFeaturedArticles() which filters by both conditions
      CREATE INDEX IF NOT EXISTS idx_articles_published_featured_created_desc
        ON public.articles (is_published, is_featured, created_at DESC, id ASC)
        WHERE is_published = true AND is_featured = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_articles_published_featured_created_desc;
      DROP INDEX IF EXISTS idx_articles_slug_trgm;
    `);
  }
}

