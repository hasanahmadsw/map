import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateSettingTranslationsToMainTable1765673660462 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Migrate English translation data to main table
    // Update siteName, siteDescription, siteLogo, siteDarkLogo, meta from English translations where they exist
    // Note: Translation values override main table values if they exist
    await queryRunner.query(`
      UPDATE public.settings s
      SET 
        site_name = COALESCE(st.site_name, s.site_name),
        site_description = COALESCE(st.site_description, s.site_description),
        site_logo = COALESCE(st.site_logo, s.site_logo),
        site_dark_logo = COALESCE(st.site_dark_logo, s.site_dark_logo),
        meta = COALESCE(st.meta, s.meta)
      FROM public.settings_translations st
      WHERE st.language_code = 'en'
        AND (st.site_name IS NOT NULL OR st.site_description IS NOT NULL 
             OR st.site_logo IS NOT NULL OR st.site_dark_logo IS NOT NULL OR st.meta IS NOT NULL);
    `);

    // Step 2: Drop indexes on settings_translations table
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_settings_translations_language_code;
    `);

    // Step 3: Drop the settings_translations table
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.settings_translations CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate settings_translations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.settings_translations (
        id SERIAL PRIMARY KEY,
        language_code VARCHAR(2) NOT NULL UNIQUE,
        site_name VARCHAR(255),
        site_description TEXT,
        site_logo VARCHAR(255),
        site_dark_logo VARCHAR(255),
        meta JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_SETTING_LANGUAGE UNIQUE (language_code)
      );
    `);

    // Recreate indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_settings_translations_language_code
        ON public.settings_translations (language_code);
    `);

    // Migrate data back to translations (only English)
    await queryRunner.query(`
      INSERT INTO public.settings_translations (language_code, site_name, site_description, site_logo, site_dark_logo, meta, created_at, updated_at)
      SELECT 'en', site_name, site_description, site_logo, site_dark_logo, meta, created_at, updated_at
      FROM public.settings
      LIMIT 1;
    `);
  }
}

