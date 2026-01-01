import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateBroadcastToBroadcastUnits1767286273749 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 0: Add INTERNET_BROADCAST to enum if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'INTERNET_BROADCAST' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'facility_type_enum')
        ) THEN
          ALTER TYPE facility_type_enum ADD VALUE 'INTERNET_BROADCAST';
        END IF;
      END $$;
    `);

    // Step 1: Check if broadcasts table exists and has data
    const broadcastsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'broadcasts'
      );
    `);

    if (broadcastsExists[0].exists) {
      // Step 2: Add type column to broadcast_units if it doesn't exist
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'broadcast_units' 
            AND column_name = 'type'
          ) THEN
            ALTER TABLE broadcast_units 
            ADD COLUMN type facility_type_enum DEFAULT 'OTHER';
          END IF;
        END $$;
      `);

      // Step 3: Migrate type from broadcasts to broadcast_units
      await queryRunner.query(`
        UPDATE broadcast_units bu
        SET type = b.type
        FROM broadcasts b
        WHERE bu.broadcast_id = b.id;
      `);

      // Step 4: Set NOT NULL constraint on type column after migration
      await queryRunner.query(`
        ALTER TABLE broadcast_units 
        ALTER COLUMN type SET NOT NULL;
      `);
    } else {
      // If broadcasts table doesn't exist, just add the type column with default
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'broadcast_units' 
            AND column_name = 'type'
          ) THEN
            ALTER TABLE broadcast_units 
            ADD COLUMN type facility_type_enum NOT NULL DEFAULT 'OTHER';
          END IF;
        END $$;
      `);
    }

    // Step 5: Drop foreign key constraint
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_broadcast_unit_broadcast' 
          AND table_name = 'broadcast_units'
        ) THEN
          ALTER TABLE broadcast_units DROP CONSTRAINT fk_broadcast_unit_broadcast;
        END IF;
      END $$;
    `);

    // Step 6: Drop old index based on broadcast_id
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_BROADCAST_UNIT_ORDER;
      DROP INDEX IF EXISTS idx_broadcast_units_broadcast_id;
      DROP INDEX IF EXISTS idx_broadcast_units_published_order;
    `);

    // Step 7: Drop broadcast_id column
    await queryRunner.query(`
      ALTER TABLE broadcast_units DROP COLUMN IF EXISTS broadcast_id;
    `);

    // Step 8: Create new index based on type and order
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_BROADCAST_UNIT_TYPE_ORDER
        ON broadcast_units (type, "order");
    `);

    // Step 9: Create index for published units filtered by type
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcast_units_published_type_order
        ON broadcast_units (type, is_published, "order" ASC, created_at DESC)
        WHERE is_published = true;
    `);

    // Step 10: Drop broadcasts table
    await queryRunner.query(`
      DROP TABLE IF EXISTS broadcasts CASCADE;
    `);

    // Step 11: Drop indexes related to broadcasts table
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_BROADCAST_TYPE_ORDER;
      DROP INDEX IF EXISTS IDX_BROADCAST_SLUG;
      DROP INDEX IF EXISTS idx_broadcasts_type;
      DROP INDEX IF EXISTS idx_broadcasts_published;
      DROP INDEX IF EXISTS idx_broadcasts_published_order;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse migration: recreate broadcasts table and restore relationships

    // Step 1: Recreate broadcasts table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS broadcasts (
        id SERIAL PRIMARY KEY,
        type facility_type_enum NOT NULL DEFAULT 'OTHER',
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        summary TEXT,
        description TEXT,
        cover_image VARCHAR(255),
        gallery JSONB,
        is_published BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Step 2: Recreate indexes for broadcasts
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

    // Step 3: Add broadcast_id column back to broadcast_units
    await queryRunner.query(`
      ALTER TABLE broadcast_units 
      ADD COLUMN IF NOT EXISTS broadcast_id INTEGER;
    `);

    // Step 4: Drop new indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_broadcast_units_published_type_order;
      DROP INDEX IF EXISTS IDX_BROADCAST_UNIT_TYPE_ORDER;
    `);

    // Step 5: Recreate foreign key constraint
    await queryRunner.query(`
      ALTER TABLE broadcast_units
      ADD CONSTRAINT fk_broadcast_unit_broadcast
        FOREIGN KEY (broadcast_id)
        REFERENCES broadcasts(id)
        ON DELETE CASCADE;
    `);

    // Step 6: Recreate old indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_BROADCAST_UNIT_ORDER
        ON broadcast_units (broadcast_id, "order");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcast_units_broadcast_id
        ON broadcast_units (broadcast_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_broadcast_units_published_order
        ON broadcast_units (broadcast_id, is_published, "order" ASC, created_at DESC)
        WHERE is_published = true;
    `);

    // Step 7: Remove type column from broadcast_units (optional, since we're reversing)
    // We'll keep it for now in case of partial rollback
  }
}
