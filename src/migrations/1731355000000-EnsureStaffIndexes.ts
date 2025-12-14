import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to ensure all staff table indexes are created
 * This migration is idempotent - it will only create indexes that don't exist
 * Run this if the previous AddStaffIndexes migration didn't run or failed partially
 */
export class EnsureStaffIndexes1731355000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- =========================
      -- staff table indexes
      -- =========================

      -- CRITICAL: Sorting the general lists (ORDER BY created_at DESC, id ASC)
      -- Used by: findAll() pagination queries
      CREATE INDEX IF NOT EXISTS idx_staff_created_desc
        ON public.staff (created_at DESC, id ASC);

      -- CRITICAL: Composite index when filtering on role with the same order
      -- Used by: findAuthors() and role-based queries
      CREATE INDEX IF NOT EXISTS idx_staff_role_created_desc
        ON public.staff (role, created_at DESC, id ASC);

      -- Queries that depend on password changes (sessions, permissions...)
      CREATE INDEX IF NOT EXISTS idx_staff_password_changed_at
        ON public.staff (password_changed_at);

      -- Search ILIKE on the name using pg_trgm (for name filtering)
      -- Requires: pg_trgm extension
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_staff_name_trgm
        ON public.staff USING gin (name gin_trgm_ops);

      -- =========================
      -- staff_translations table indexes
      -- =========================

      -- ⚠️ CRITICAL: Speed up the JOIN on staff_id
      -- This is THE MOST IMPORTANT missing index!
      -- Without this, LEFT JOIN operations will be extremely slow (sequential scans)
      -- Used by: findAll() LEFT JOIN staff.translations
      CREATE INDEX IF NOT EXISTS idx_staff_translations_staff_id
        ON public.staff_translations (staff_id);

      -- Quick access to the translation of a specific language for a specific staff
      -- Used by: findOneAuthor() and language-specific queries
      CREATE INDEX IF NOT EXISTS idx_staff_translations_lang_staff
        ON public.staff_translations (language_code, staff_id);

      -- Quick access to the default translation for each staff
      -- Used by: Queries filtering by is_default = true
      CREATE INDEX IF NOT EXISTS idx_staff_translations_default_per_staff
        ON public.staff_translations (staff_id)
        WHERE is_default = true;

      -- Search ILIKE on the name using pg_trgm
      CREATE INDEX IF NOT EXISTS idx_staff_translations_name_trgm
        ON public.staff_translations USING gin (name gin_trgm_ops);

      -- Search ILIKE on the bio using pg_trgm
      CREATE INDEX IF NOT EXISTS idx_staff_translations_bio_trgm
        ON public.staff_translations USING gin (bio gin_trgm_ops);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Drop staff_translations indexes
      DROP INDEX IF EXISTS public.idx_staff_translations_bio_trgm;
      DROP INDEX IF EXISTS public.idx_staff_translations_name_trgm;
      DROP INDEX IF EXISTS public.idx_staff_translations_default_per_staff;
      DROP INDEX IF EXISTS public.idx_staff_translations_lang_staff;
      DROP INDEX IF EXISTS public.idx_staff_translations_staff_id;

      -- Drop staff indexes
      DROP INDEX IF EXISTS public.idx_staff_name_trgm;
      DROP INDEX IF EXISTS public.idx_staff_password_changed_at;
      DROP INDEX IF EXISTS public.idx_staff_role_created_desc;
      DROP INDEX IF EXISTS public.idx_staff_created_desc;
    `);
  }
}
