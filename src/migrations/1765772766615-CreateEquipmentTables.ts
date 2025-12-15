import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEquipmentTables1765772766615 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =========================
    // equipment_brands
    // =========================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.equipment_brands (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create unique index on slug for equipment_brands
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_EQUIPMENT_BRAND_SLUG
        ON public.equipment_brands (slug);
    `);

    // =========================
    // equipment_categories
    // =========================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.equipment_categories (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id INTEGER,
        "order" INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_equipment_category_parent
          FOREIGN KEY (parent_id)
          REFERENCES public.equipment_categories(id)
          ON DELETE SET NULL
      );
    `);

    // Create unique index on slug for equipment_categories
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_EQUIPMENT_CATEGORY_SLUG
        ON public.equipment_categories (slug);
    `);

    // Create index on parent_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_categories_parent_id
        ON public.equipment_categories (parent_id);
    `);

    // =========================
    // equipment_items
    // =========================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.equipment_items (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        summary TEXT,
        description TEXT,
        category_id INTEGER NOT NULL,
        brand_id INTEGER NOT NULL,
        equipment_type VARCHAR(50) NOT NULL,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        is_published BOOLEAN NOT NULL DEFAULT false,
        "order" INTEGER NOT NULL DEFAULT 0,
        cover_path VARCHAR(500),
        gallery_paths JSONB,
        manual_path VARCHAR(500),
        video_url VARCHAR(500),
        specs JSONB,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        view_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_equipment_item_category
          FOREIGN KEY (category_id)
          REFERENCES public.equipment_categories(id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_equipment_item_brand
          FOREIGN KEY (brand_id)
          REFERENCES public.equipment_brands(id)
          ON DELETE RESTRICT,
        CONSTRAINT chk_equipment_type
          CHECK (equipment_type IN ('camera', 'lens', 'light', 'audio', 'accessory')),
        CONSTRAINT chk_equipment_status
          CHECK (status IN ('active', 'archived'))
      );
    `);

    // Create indexes for equipment_items
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_EQUIPMENT_ITEM_SLUG
        ON public.equipment_items (slug);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_EQUIPMENT_ITEM_TYPE
        ON public.equipment_items (equipment_type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_EQUIPMENT_ITEM_PUBLISHED
        ON public.equipment_items (is_published);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_items_category_id
        ON public.equipment_items (category_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_items_brand_id
        ON public.equipment_items (brand_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_items_status
        ON public.equipment_items (status);
    `);

    // Composite index for common filtering and sorting
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_items_published_order
        ON public.equipment_items (is_published, "order" ASC, created_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_items_featured_order
        ON public.equipment_items (is_featured, "order" ASC, created_at DESC);
    `);

    // Search indexes using pg_trgm for text search
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_items_name_trgm
        ON public.equipment_items USING gin (name gin_trgm_ops);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_items_slug_trgm
        ON public.equipment_items USING gin (slug gin_trgm_ops);
    `);

    // Index for brands and categories ordering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_brands_order
        ON public.equipment_brands ("order" ASC, created_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_categories_order
        ON public.equipment_categories ("order" ASC, created_at DESC);
    `);

    // Index for active brands and categories
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_brands_active
        ON public.equipment_brands (is_active)
        WHERE is_active = true;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_categories_active
        ON public.equipment_categories (is_active)
        WHERE is_active = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_equipment_categories_active;
      DROP INDEX IF EXISTS idx_equipment_brands_active;
      DROP INDEX IF EXISTS idx_equipment_categories_order;
      DROP INDEX IF EXISTS idx_equipment_brands_order;
      DROP INDEX IF EXISTS idx_equipment_items_slug_trgm;
      DROP INDEX IF EXISTS idx_equipment_items_name_trgm;
      DROP INDEX IF EXISTS idx_equipment_items_featured_order;
      DROP INDEX IF EXISTS idx_equipment_items_published_order;
      DROP INDEX IF EXISTS idx_equipment_items_status;
      DROP INDEX IF EXISTS idx_equipment_items_brand_id;
      DROP INDEX IF EXISTS idx_equipment_items_category_id;
      DROP INDEX IF EXISTS IDX_EQUIPMENT_ITEM_PUBLISHED;
      DROP INDEX IF EXISTS IDX_EQUIPMENT_ITEM_TYPE;
      DROP INDEX IF EXISTS IDX_EQUIPMENT_ITEM_SLUG;
      DROP INDEX IF EXISTS idx_equipment_categories_parent_id;
      DROP INDEX IF EXISTS IDX_EQUIPMENT_CATEGORY_SLUG;
      DROP INDEX IF EXISTS IDX_EQUIPMENT_BRAND_SLUG;
    `);

    // Drop tables (order matters due to foreign keys)
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.equipment_items CASCADE;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS public.equipment_categories CASCADE;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS public.equipment_brands CASCADE;
    `);
  }
}

