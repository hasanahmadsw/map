import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateArticleTranslationsToMainTable1765673156291 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add translated columns to articles table
    await queryRunner.query(`
      ALTER TABLE public.articles
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS content TEXT,
      ADD COLUMN IF NOT EXISTS excerpt TEXT,
      ADD COLUMN IF NOT EXISTS meta JSONB;
    `);

    // Step 2: Migrate English translation data to main table
    // Update name, content, excerpt, and meta from English translations where they exist
    await queryRunner.query(`
      UPDATE public.articles a
      SET 
        name = at.name,
        content = at.content,
        excerpt = at.excerpt,
        meta = at.meta
      FROM public.articles_translations at
      WHERE a.id = at.article_id
        AND at.language_code = 'en'
        AND (at.name IS NOT NULL OR at.content IS NOT NULL OR at.excerpt IS NOT NULL OR at.meta IS NOT NULL);
    `);

    // Step 3: Drop indexes on articles_translations table
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_ARTICLE_TRANSLATION_NAME;
      DROP INDEX IF EXISTS idx_articles_translations_article_id;
      DROP INDEX IF EXISTS idx_articles_translations_lang_article;
      DROP INDEX IF EXISTS idx_articles_translations_default_per_article;
      DROP INDEX IF EXISTS idx_articles_translations_name_trgm;
      DROP INDEX IF EXISTS idx_articles_translations_content_trgm;
      DROP INDEX IF EXISTS idx_articles_translations_excerpt_trgm;
    `);

    // Step 4: Drop the articles_translations table
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.articles_translations CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate articles_translations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.articles_translations (
        id SERIAL PRIMARY KEY,
        article_id INTEGER NOT NULL,
        language_code VARCHAR(2) NOT NULL,
        name VARCHAR(255),
        content TEXT,
        excerpt TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        meta JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_ARTICLE_LANGUAGE UNIQUE (article_id, language_code),
        CONSTRAINT FK_articles_translations_article FOREIGN KEY (article_id) 
          REFERENCES public.articles(id) ON DELETE CASCADE
      );
    `);

    // Recreate indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_ARTICLE_TRANSLATION_NAME
        ON public.articles_translations (name);
      
      CREATE INDEX IF NOT EXISTS idx_articles_translations_article_id
        ON public.articles_translations (article_id);
      
      CREATE INDEX IF NOT EXISTS idx_articles_translations_lang_article
        ON public.articles_translations (language_code, article_id);
      
      CREATE INDEX IF NOT EXISTS idx_articles_translations_default_per_article
        ON public.articles_translations (article_id)
        WHERE is_default = true;
      
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_articles_translations_name_trgm
        ON public.articles_translations USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_articles_translations_content_trgm
        ON public.articles_translations USING gin (content gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_articles_translations_excerpt_trgm
        ON public.articles_translations USING gin (excerpt gin_trgm_ops);
    `);

    // Migrate data back to translations (only English)
    await queryRunner.query(`
      INSERT INTO public.articles_translations (article_id, language_code, name, content, excerpt, meta, is_default, created_at, updated_at)
      SELECT id, 'en', name, content, excerpt, meta, TRUE, created_at, updated_at
      FROM public.articles
      WHERE name IS NOT NULL OR content IS NOT NULL OR excerpt IS NOT NULL OR meta IS NOT NULL;
    `);

    // Remove columns from articles table
    await queryRunner.query(`
      ALTER TABLE public.articles
      DROP COLUMN IF EXISTS name,
      DROP COLUMN IF EXISTS content,
      DROP COLUMN IF EXISTS excerpt,
      DROP COLUMN IF EXISTS meta;
    `);
  }
}
