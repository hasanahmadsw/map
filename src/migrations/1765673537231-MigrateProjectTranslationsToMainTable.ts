import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateProjectTranslationsToMainTable1765673537231 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add translated columns to projects table
    await queryRunner.query(`
      ALTER TABLE public.projects
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS short_description TEXT,
      ADD COLUMN IF NOT EXISTS meta JSONB,
      ADD COLUMN IF NOT EXISTS challenges JSONB,
      ADD COLUMN IF NOT EXISTS results JSONB;
    `);

    // Step 2: Migrate English translation data to main table
    // Update name, description, shortDescription, meta, challenges, and results from English translations where they exist
    await queryRunner.query(`
      UPDATE public.projects p
      SET 
        name = pt.name,
        description = pt.description,
        short_description = pt.short_description,
        meta = pt.meta,
        challenges = pt.challenges,
        results = pt.results
      FROM public.projects_translations pt
      WHERE p.id = pt.project_id
        AND pt.language_code = 'en'
        AND (pt.name IS NOT NULL OR pt.description IS NOT NULL OR pt.short_description IS NOT NULL 
             OR pt.meta IS NOT NULL OR pt.challenges IS NOT NULL OR pt.results IS NOT NULL);
    `);

    // Step 3: Drop indexes on projects_translations table
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_PROJECT_TRANSLATION_NAME;
      DROP INDEX IF EXISTS idx_projects_translations_project_id;
      DROP INDEX IF EXISTS idx_projects_translations_lang_project;
      DROP INDEX IF EXISTS idx_projects_translations_default_per_project;
      DROP INDEX IF EXISTS idx_projects_translations_name_trgm;
      DROP INDEX IF EXISTS idx_projects_translations_description_trgm;
      DROP INDEX IF EXISTS idx_projects_translations_short_description_trgm;
    `);

    // Step 4: Drop the projects_translations table
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.projects_translations CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate projects_translations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.projects_translations (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        language_code VARCHAR(2) NOT NULL,
        name VARCHAR(255),
        description TEXT,
        short_description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        meta JSONB,
        challenges JSONB,
        results JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_PROJECT_LANGUAGE UNIQUE (project_id, language_code),
        CONSTRAINT FK_projects_translations_project FOREIGN KEY (project_id) 
          REFERENCES public.projects(id) ON DELETE CASCADE
      );
    `);

    // Recreate indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_PROJECT_TRANSLATION_NAME
        ON public.projects_translations (name);
      
      CREATE INDEX IF NOT EXISTS idx_projects_translations_project_id
        ON public.projects_translations (project_id);
      
      CREATE INDEX IF NOT EXISTS idx_projects_translations_lang_project
        ON public.projects_translations (language_code, project_id);
      
      CREATE INDEX IF NOT EXISTS idx_projects_translations_default_per_project
        ON public.projects_translations (project_id)
        WHERE is_default = true;
      
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_projects_translations_name_trgm
        ON public.projects_translations USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_projects_translations_description_trgm
        ON public.projects_translations USING gin (description gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_projects_translations_short_description_trgm
        ON public.projects_translations USING gin (short_description gin_trgm_ops);
    `);

    // Migrate data back to translations (only English)
    await queryRunner.query(`
      INSERT INTO public.projects_translations (project_id, language_code, name, description, short_description, meta, challenges, results, is_default, created_at, updated_at)
      SELECT id, 'en', name, description, short_description, meta, challenges, results, TRUE, created_at, updated_at
      FROM public.projects
      WHERE name IS NOT NULL OR description IS NOT NULL OR short_description IS NOT NULL 
            OR meta IS NOT NULL OR challenges IS NOT NULL OR results IS NOT NULL;
    `);

    // Remove columns from projects table
    await queryRunner.query(`
      ALTER TABLE public.projects
      DROP COLUMN IF EXISTS name,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS short_description,
      DROP COLUMN IF EXISTS meta,
      DROP COLUMN IF EXISTS challenges,
      DROP COLUMN IF EXISTS results;
    `);
  }
}
