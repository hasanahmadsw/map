import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateServiceTranslationsToMainTable1765673285808 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add translated columns to services table
    await queryRunner.query(`
      ALTER TABLE public.services
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS short_description TEXT,
      ADD COLUMN IF NOT EXISTS meta JSONB,
      ADD COLUMN IF NOT EXISTS sub_services JSONB;
    `);

    // Step 2: Migrate English translation data to main table
    // Update name, description, shortDescription, meta, and subServices from English translations where they exist
    await queryRunner.query(`
      UPDATE public.services s
      SET 
        name = st.name,
        description = st.description,
        short_description = st.short_description,
        meta = st.meta,
        sub_services = st.sub_services
      FROM public.services_translations st
      WHERE s.id = st.service_id
        AND st.language_code = 'en'
        AND (st.name IS NOT NULL OR st.description IS NOT NULL OR st.short_description IS NOT NULL OR st.meta IS NOT NULL OR st.sub_services IS NOT NULL);
    `);

    // Step 3: Drop indexes on services_translations table
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_SERVICE_TRANSLATION_NAME;
      DROP INDEX IF EXISTS idx_services_translations_service_id;
      DROP INDEX IF EXISTS idx_services_translations_lang_service;
      DROP INDEX IF EXISTS idx_services_translations_default_per_service;
      DROP INDEX IF EXISTS idx_services_translations_name_trgm;
      DROP INDEX IF EXISTS idx_services_translations_description_trgm;
      DROP INDEX IF EXISTS idx_services_translations_short_description_trgm;
    `);

    // Step 4: Drop the services_translations table
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.services_translations CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate services_translations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.services_translations (
        id SERIAL PRIMARY KEY,
        service_id INTEGER NOT NULL,
        language_code VARCHAR(2) NOT NULL,
        name VARCHAR(255),
        description TEXT,
        short_description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        meta JSONB,
        sub_services JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_SERVICE_LANGUAGE UNIQUE (service_id, language_code),
        CONSTRAINT FK_services_translations_service FOREIGN KEY (service_id) 
          REFERENCES public.services(id) ON DELETE CASCADE
      );
    `);

    // Recreate indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_SERVICE_TRANSLATION_NAME
        ON public.services_translations (name);
      
      CREATE INDEX IF NOT EXISTS idx_services_translations_service_id
        ON public.services_translations (service_id);
      
      CREATE INDEX IF NOT EXISTS idx_services_translations_lang_service
        ON public.services_translations (language_code, service_id);
      
      CREATE INDEX IF NOT EXISTS idx_services_translations_default_per_service
        ON public.services_translations (service_id)
        WHERE is_default = true;
      
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_services_translations_name_trgm
        ON public.services_translations USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_services_translations_description_trgm
        ON public.services_translations USING gin (description gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_services_translations_short_description_trgm
        ON public.services_translations USING gin (short_description gin_trgm_ops);
    `);

    // Migrate data back to translations (only English)
    await queryRunner.query(`
      INSERT INTO public.services_translations (service_id, language_code, name, description, short_description, meta, sub_services, is_default, created_at, updated_at)
      SELECT id, 'en', name, description, short_description, meta, sub_services, TRUE, created_at, updated_at
      FROM public.services
      WHERE name IS NOT NULL OR description IS NOT NULL OR short_description IS NOT NULL OR meta IS NOT NULL OR sub_services IS NOT NULL;
    `);

    // Remove columns from services table
    await queryRunner.query(`
      ALTER TABLE public.services
      DROP COLUMN IF EXISTS name,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS short_description,
      DROP COLUMN IF EXISTS meta,
      DROP COLUMN IF EXISTS sub_services;
    `);
  }
}
