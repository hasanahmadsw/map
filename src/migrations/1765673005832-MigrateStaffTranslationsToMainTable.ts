import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateStaffTranslationsToMainTable1765673005832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add bio column to staff table
    await queryRunner.query(`
      ALTER TABLE public.staff
      ADD COLUMN IF NOT EXISTS bio TEXT;
    `);

    // Step 2: Migrate English translation data to main table
    // Update bio from English translations where they exist
    await queryRunner.query(`
      UPDATE public.staff s
      SET bio = st.bio
      FROM public.staff_translations st
      WHERE s.id = st.staff_id
        AND st.language_code = 'en'
        AND st.bio IS NOT NULL;
    `);

    // Step 3: Drop indexes on staff_translations table
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_staff_translations_bio_trgm;
      DROP INDEX IF EXISTS idx_staff_translations_name_trgm;
      DROP INDEX IF EXISTS idx_staff_translations_default_per_staff;
      DROP INDEX IF EXISTS idx_staff_translations_lang_staff;
      DROP INDEX IF EXISTS idx_staff_translations_staff_id;
    `);

    // Step 4: Drop the staff_translations table
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.staff_translations CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate staff_translations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.staff_translations (
        id SERIAL PRIMARY KEY,
        staff_id INTEGER NOT NULL,
        language_code VARCHAR(2) NOT NULL,
        name VARCHAR(255),
        bio TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_STAFF_LANGUAGE UNIQUE (staff_id, language_code),
        CONSTRAINT FK_staff_translations_staff FOREIGN KEY (staff_id) 
          REFERENCES public.staff(id) ON DELETE CASCADE
      );
    `);

    // Recreate indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_staff_translations_staff_id
        ON public.staff_translations (staff_id);
      
      CREATE INDEX IF NOT EXISTS idx_staff_translations_lang_staff
        ON public.staff_translations (language_code, staff_id);
      
      CREATE INDEX IF NOT EXISTS idx_staff_translations_default_per_staff
        ON public.staff_translations (staff_id)
        WHERE is_default = true;
      
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_staff_translations_name_trgm
        ON public.staff_translations USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_staff_translations_bio_trgm
        ON public.staff_translations USING gin (bio gin_trgm_ops);
    `);

    // Migrate bio data back to translations (only English)
    await queryRunner.query(`
      INSERT INTO public.staff_translations (staff_id, language_code, bio, is_default, created_at, updated_at)
      SELECT id, 'en', bio, TRUE, created_at, updated_at
      FROM public.staff
      WHERE bio IS NOT NULL;
    `);

    // Remove bio column from staff table
    await queryRunner.query(`
      ALTER TABLE public.staff
      DROP COLUMN IF EXISTS bio;
    `);
  }
}
