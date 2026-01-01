import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameFacilitiesToBroadcastAndRemoveSolutionKey1767280154855 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop foreign key constraint from facility_units to facilities
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_facility_unit_facility' 
          AND table_name = 'facility_units'
        ) THEN
          ALTER TABLE facility_units DROP CONSTRAINT fk_facility_unit_facility;
        END IF;
      END $$;
    `);

    // Step 2: Drop indexes that reference solution_id or solution_key (if they exist)
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_facilities_solution_id;
      DROP INDEX IF EXISTS idx_facilities_published_order;
      DROP INDEX IF EXISTS IDX_FACILITY_TYPE_ORDER;
      DROP INDEX IF EXISTS IDX_FACILITY_SLUG;
    `);

    // Step 3: Remove solution_key column from facilities if it exists (from previous migration)
    await queryRunner.query(`
      ALTER TABLE facilities DROP COLUMN IF EXISTS solution_key;
    `);

    // Step 4: Remove solution_id column from facilities if it exists (from old migration)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_facility_solution' 
          AND table_name = 'facilities'
        ) THEN
          ALTER TABLE facilities DROP CONSTRAINT fk_facility_solution;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE facilities DROP COLUMN IF EXISTS solution_id;
    `);

    // Step 5: Rename facility_type_enum to broadcast_type_enum (if needed, or keep same)
    // Actually, we'll keep the enum name as is since it's already created

    // Step 6: Rename facilities table to broadcasts
    await queryRunner.query(`
      ALTER TABLE facilities RENAME TO broadcasts;
    `);

    // Step 7: Rename facility_units table to broadcast_units
    await queryRunner.query(`
      ALTER TABLE facility_units RENAME TO broadcast_units;
    `);

    // Step 8: Rename foreign key column in broadcast_units
    await queryRunner.query(`
      ALTER TABLE broadcast_units RENAME COLUMN facility_id TO broadcast_id;
    `);

    // Step 9: Recreate foreign key constraint with new names
    await queryRunner.query(`
      ALTER TABLE broadcast_units
      ADD CONSTRAINT fk_broadcast_unit_broadcast
        FOREIGN KEY (broadcast_id)
        REFERENCES broadcasts(id)
        ON DELETE CASCADE;
    `);

    // Step 10: Recreate indexes with new table names and without solution_id/solution_key
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_BROADCAST_TYPE_ORDER
        ON broadcasts (type, "order");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_BROADCAST_SLUG
        ON broadcasts (slug);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcasts_type
        ON broadcasts (type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcasts_published
        ON broadcasts (is_published)
        WHERE is_published = true;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcasts_published_order
        ON broadcasts (is_published, "order" ASC, created_at DESC)
        WHERE is_published = true;
    `);

    // Step 11: Update indexes for broadcast_units
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_FACILITY_UNIT_ORDER;
      DROP INDEX IF EXISTS IDX_FACILITY_UNIT_SLUG;
      DROP INDEX IF EXISTS idx_facility_units_facility_id;
      DROP INDEX IF EXISTS idx_facility_units_published;
      DROP INDEX IF EXISTS idx_facility_units_published_order;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_BROADCAST_UNIT_ORDER
        ON broadcast_units (broadcast_id, "order");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_BROADCAST_UNIT_SLUG
        ON broadcast_units (slug);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcast_units_broadcast_id
        ON broadcast_units (broadcast_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcast_units_published
        ON broadcast_units (is_published)
        WHERE is_published = true;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcast_units_published_order
        ON broadcast_units (broadcast_id, is_published, "order" ASC, created_at DESC)
        WHERE is_published = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the process: rename back to facilities

    // Drop new indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_broadcast_units_published_order;
      DROP INDEX IF EXISTS idx_broadcast_units_published;
      DROP INDEX IF EXISTS idx_broadcast_units_broadcast_id;
      DROP INDEX IF EXISTS IDX_BROADCAST_UNIT_SLUG;
      DROP INDEX IF EXISTS IDX_BROADCAST_UNIT_ORDER;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_broadcasts_published_order;
      DROP INDEX IF EXISTS idx_broadcasts_published;
      DROP INDEX IF EXISTS idx_broadcasts_type;
      DROP INDEX IF EXISTS IDX_BROADCAST_SLUG;
      DROP INDEX IF EXISTS IDX_BROADCAST_TYPE_ORDER;
    `);

    // Drop foreign key
    await queryRunner.query(`
      ALTER TABLE broadcast_units DROP CONSTRAINT IF EXISTS fk_broadcast_unit_broadcast;
    `);

    // Rename column back
    await queryRunner.query(`
      ALTER TABLE broadcast_units RENAME COLUMN broadcast_id TO facility_id;
    `);

    // Rename tables back
    await queryRunner.query(`
      ALTER TABLE broadcasts RENAME TO facilities;
    `);

    await queryRunner.query(`
      ALTER TABLE broadcast_units RENAME TO facility_units;
    `);

    // Recreate old foreign key
    await queryRunner.query(`
      ALTER TABLE facility_units
      ADD CONSTRAINT fk_facility_unit_facility
        FOREIGN KEY (facility_id)
        REFERENCES facilities(id)
        ON DELETE CASCADE;
    `);

    // Recreate old indexes (with solution_id if it was there)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_FACILITY_TYPE_ORDER
        ON facilities (type, "order");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_FACILITY_SLUG
        ON facilities (slug);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facilities_type
        ON facilities (type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facilities_published
        ON facilities (is_published)
        WHERE is_published = true;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_FACILITY_UNIT_ORDER
        ON facility_units (facility_id, "order");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_FACILITY_UNIT_SLUG
        ON facility_units (facility_id, slug);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facility_units_facility_id
        ON facility_units (facility_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_facility_units_published
        ON facility_units (is_published)
        WHERE is_published = true;
    `);
  }
}

