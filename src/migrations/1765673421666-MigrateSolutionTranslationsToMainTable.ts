import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateSolutionTranslationsToMainTable1765673421666 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add translated columns to solutions table
    await queryRunner.query(`
      ALTER TABLE public.solutions
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS short_description TEXT,
      ADD COLUMN IF NOT EXISTS meta JSONB;
    `);

    // Step 2: Migrate English translation data to main table
    // Update name, description, shortDescription, and meta from English translations where they exist
    await queryRunner.query(`
      UPDATE public.solutions s
      SET 
        name = st.name,
        description = st.description,
        short_description = st.short_description,
        meta = st.meta
      FROM public.solutions_translations st
      WHERE s.id = st.solution_id
        AND st.language_code = 'en'
        AND (st.name IS NOT NULL OR st.description IS NOT NULL OR st.short_description IS NOT NULL OR st.meta IS NOT NULL);
    `);

    // Step 3: Drop indexes on solutions_translations table
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_SOLUTION_TRANSLATION_NAME;
      DROP INDEX IF EXISTS idx_solutions_translations_solution_id;
      DROP INDEX IF EXISTS idx_solutions_translations_lang_solution;
      DROP INDEX IF EXISTS idx_solutions_translations_default_per_solution;
      DROP INDEX IF EXISTS idx_solutions_translations_name_trgm;
      DROP INDEX IF EXISTS idx_solutions_translations_description_trgm;
      DROP INDEX IF EXISTS idx_solutions_translations_short_description_trgm;
    `);

    // Step 4: Drop the solutions_translations table
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.solutions_translations CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate solutions_translations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.solutions_translations (
        id SERIAL PRIMARY KEY,
        solution_id INTEGER NOT NULL,
        language_code VARCHAR(2) NOT NULL,
        name VARCHAR(255),
        description TEXT,
        short_description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        meta JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_SOLUTION_LANGUAGE UNIQUE (solution_id, language_code),
        CONSTRAINT FK_solutions_translations_solution FOREIGN KEY (solution_id) 
          REFERENCES public.solutions(id) ON DELETE CASCADE
      );
    `);

    // Recreate indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_SOLUTION_TRANSLATION_NAME
        ON public.solutions_translations (name);
      
      CREATE INDEX IF NOT EXISTS idx_solutions_translations_solution_id
        ON public.solutions_translations (solution_id);
      
      CREATE INDEX IF NOT EXISTS idx_solutions_translations_lang_solution
        ON public.solutions_translations (language_code, solution_id);
      
      CREATE INDEX IF NOT EXISTS idx_solutions_translations_default_per_solution
        ON public.solutions_translations (solution_id)
        WHERE is_default = true;
      
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_solutions_translations_name_trgm
        ON public.solutions_translations USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_solutions_translations_description_trgm
        ON public.solutions_translations USING gin (description gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_solutions_translations_short_description_trgm
        ON public.solutions_translations USING gin (short_description gin_trgm_ops);
    `);

    // Migrate data back to translations (only English)
    await queryRunner.query(`
      INSERT INTO public.solutions_translations (solution_id, language_code, name, description, short_description, meta, is_default, created_at, updated_at)
      SELECT id, 'en', name, description, short_description, meta, TRUE, created_at, updated_at
      FROM public.solutions
      WHERE name IS NOT NULL OR description IS NOT NULL OR short_description IS NOT NULL OR meta IS NOT NULL;
    `);

    // Remove columns from solutions table
    await queryRunner.query(`
      ALTER TABLE public.solutions
      DROP COLUMN IF EXISTS name,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS short_description,
      DROP COLUMN IF EXISTS meta;
    `);
  }
}

