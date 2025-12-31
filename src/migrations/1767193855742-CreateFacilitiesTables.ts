import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFacilitiesTables1767193855742 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for facility type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE facility_type_enum AS ENUM ('OBVAN', 'FLIGHT_CASE', 'SNG', 'STUDIO', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // =========================
    // facilities
    // =========================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.facilities (
        id SERIAL PRIMARY KEY,
        solution_id INTEGER NOT NULL,
        type facility_type_enum NOT NULL DEFAULT 'OTHER',
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        summary TEXT,
        description TEXT,
        cover_image VARCHAR(500),
        gallery JSONB,
        is_published BOOLEAN NOT NULL DEFAULT false,
        view_count INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_facility_solution
          FOREIGN KEY (solution_id)
          REFERENCES public.solutions(id)
          ON DELETE CASCADE
      );
    `);

    // Create indexes for facilities
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_FACILITY_TYPE_ORDER
        ON public.facilities (solution_id, type, "order");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_FACILITY_SLUG
        ON public.facilities (solution_id, slug);
    `);

    // Index on solution_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facilities_solution_id
        ON public.facilities (solution_id);
    `);

    // Index on type for filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facilities_type
        ON public.facilities (type);
    `);

    // Index on is_published for filtering published facilities
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facilities_published
        ON public.facilities (is_published)
        WHERE is_published = true;
    `);

    // Composite index for common filtering and sorting
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facilities_published_order
        ON public.facilities (solution_id, is_published, "order" ASC, created_at DESC)
        WHERE is_published = true;
    `);

    // =========================
    // facility_units
    // =========================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.facility_units (
        id SERIAL PRIMARY KEY,
        facility_id INTEGER NOT NULL,
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        summary TEXT,
        description TEXT,
        specs JSONB,
        cover_image VARCHAR(500),
        gallery JSONB,
        is_published BOOLEAN NOT NULL DEFAULT false,
        view_count INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        items JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_facility_unit_facility
          FOREIGN KEY (facility_id)
          REFERENCES public.facilities(id)
          ON DELETE CASCADE
      );
    `);

    // Create indexes for facility_units
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_FACILITY_UNIT_ORDER
        ON public.facility_units (facility_id, "order");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_FACILITY_UNIT_SLUG
        ON public.facility_units (facility_id, slug);
    `);

    // Index on facility_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facility_units_facility_id
        ON public.facility_units (facility_id);
    `);

    // Index on is_published for filtering published units
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facility_units_published
        ON public.facility_units (is_published)
        WHERE is_published = true;
    `);

    // Composite index for common filtering and sorting
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facility_units_published_order
        ON public.facility_units (facility_id, is_published, "order" ASC, created_at DESC)
        WHERE is_published = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_facility_units_published_order;
      DROP INDEX IF EXISTS idx_facility_units_published;
      DROP INDEX IF EXISTS idx_facility_units_facility_id;
      DROP INDEX IF EXISTS IDX_FACILITY_UNIT_SLUG;
      DROP INDEX IF EXISTS IDX_FACILITY_UNIT_ORDER;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_facilities_published_order;
      DROP INDEX IF EXISTS idx_facilities_published;
      DROP INDEX IF EXISTS idx_facilities_type;
      DROP INDEX IF EXISTS idx_facilities_solution_id;
      DROP INDEX IF EXISTS IDX_FACILITY_SLUG;
      DROP INDEX IF EXISTS IDX_FACILITY_TYPE_ORDER;
    `);

    // Drop tables (order matters due to foreign keys)
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.facility_units CASCADE;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS public.facilities CASCADE;
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS facility_type_enum;
    `);
  }
}
