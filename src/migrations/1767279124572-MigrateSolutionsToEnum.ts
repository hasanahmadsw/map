import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateSolutionsToEnum1767279124572 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Create enum type for solution_key
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE solution_key_enum AS ENUM ('PRODUCTION', 'EVENTS', 'PHOTOGRAPHY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Step 2: Add solution_key column to services table (nullable initially)
    await queryRunner.query(`
      ALTER TABLE services 
      ADD COLUMN solution_key solution_key_enum;
    `);

    // Step 3: Migrate data from solution_services junction table to services.solution_key
    // Strategy: For each service, if it has solutions, take the first solution's slug
    // and map it to the corresponding enum value
    // Note: This assumes solution slugs match enum values (production, events, photography)
    await queryRunner.query(`
      UPDATE services s
      SET solution_key = CASE
        WHEN EXISTS (
          SELECT 1 FROM solution_services ss
          INNER JOIN solutions sol ON ss.solution_id = sol.id
          WHERE ss.service_id = s.id
          AND LOWER(sol.slug) = 'production'
        ) THEN 'PRODUCTION'::solution_key_enum
        WHEN EXISTS (
          SELECT 1 FROM solution_services ss
          INNER JOIN solutions sol ON ss.solution_id = sol.id
          WHERE ss.service_id = s.id
          AND LOWER(sol.slug) = 'events'
        ) THEN 'EVENTS'::solution_key_enum
        WHEN EXISTS (
          SELECT 1 FROM solution_services ss
          INNER JOIN solutions sol ON ss.solution_id = sol.id
          WHERE ss.service_id = s.id
          AND LOWER(sol.slug) = 'photography'
        ) THEN 'PHOTOGRAPHY'::solution_key_enum
        ELSE NULL
      END
      WHERE EXISTS (
        SELECT 1 FROM solution_services ss WHERE ss.service_id = s.id
      );
    `);

    // Alternative approach: If solution slugs don't match, use the first solution by ID
    // This is a fallback for services that didn't get updated above
    await queryRunner.query(`
      UPDATE services s
      SET solution_key = (
        SELECT CASE
          WHEN LOWER(sol.slug) LIKE '%production%' THEN 'PRODUCTION'::solution_key_enum
          WHEN LOWER(sol.slug) LIKE '%event%' THEN 'EVENTS'::solution_key_enum
          WHEN LOWER(sol.slug) LIKE '%photo%' THEN 'PHOTOGRAPHY'::solution_key_enum
          ELSE 'PRODUCTION'::solution_key_enum -- Default fallback
        END
        FROM solution_services ss
        INNER JOIN solutions sol ON ss.solution_id = sol.id
        WHERE ss.service_id = s.id
        ORDER BY sol.id ASC
        LIMIT 1
      )
      WHERE s.solution_key IS NULL
      AND EXISTS (
        SELECT 1 FROM solution_services ss WHERE ss.service_id = s.id
      );
    `);

    // Step 4: Drop foreign key constraints and indexes related to solution_services
    // First, check if solution_projects table exists and drop its foreign keys
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Drop foreign key from solution_projects if exists
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'FK_solution_projects_solution_id' 
          AND table_name = 'solution_projects'
        ) THEN
          ALTER TABLE solution_projects DROP CONSTRAINT FK_solution_projects_solution_id;
        END IF;
        
        -- Drop foreign key from solution_projects if exists (alternative name)
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name LIKE '%solution_projects%solution%' 
          AND table_name = 'solution_projects'
        ) THEN
          EXECUTE (
            SELECT 'ALTER TABLE solution_projects DROP CONSTRAINT ' || constraint_name
            FROM information_schema.table_constraints 
            WHERE constraint_name LIKE '%solution_projects%solution%' 
            AND table_name = 'solution_projects'
            LIMIT 1
          );
        END IF;
      END $$;
    `);

    // Step 5: Drop solution_services junction table
    await queryRunner.query(`
      DROP TABLE IF EXISTS solution_services CASCADE;
    `);

    // Step 6: Drop solution_projects junction table (if projects should not be linked to solutions)
    await queryRunner.query(`
      DROP TABLE IF EXISTS solution_projects CASCADE;
    `);

    // Step 7: Drop foreign key constraint from facilities table
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Drop foreign key from facilities if exists
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_facility_solution' 
          AND table_name = 'facilities'
        ) THEN
          ALTER TABLE facilities DROP CONSTRAINT fk_facility_solution;
        END IF;
      END $$;
    `);

    // Step 8: Migrate facilities.solution_id to facilities.solution_key
    await queryRunner.query(`
      ALTER TABLE facilities 
      ADD COLUMN IF NOT EXISTS solution_key solution_key_enum;
    `);

    await queryRunner.query(`
      UPDATE facilities f
      SET solution_key = CASE
        WHEN EXISTS (
          SELECT 1 FROM solutions sol
          WHERE sol.id = f.solution_id
          AND LOWER(sol.slug) = 'production'
        ) THEN 'PRODUCTION'::solution_key_enum
        WHEN EXISTS (
          SELECT 1 FROM solutions sol
          WHERE sol.id = f.solution_id
          AND LOWER(sol.slug) = 'events'
        ) THEN 'EVENTS'::solution_key_enum
        WHEN EXISTS (
          SELECT 1 FROM solutions sol
          WHERE sol.id = f.solution_id
          AND LOWER(sol.slug) = 'photography'
        ) THEN 'PHOTOGRAPHY'::solution_key_enum
        ELSE 'PRODUCTION'::solution_key_enum -- Default fallback
      END
      WHERE f.solution_id IS NOT NULL;
    `);

    // Alternative approach for facilities
    await queryRunner.query(`
      UPDATE facilities f
      SET solution_key = (
        SELECT CASE
          WHEN LOWER(sol.slug) LIKE '%production%' THEN 'PRODUCTION'::solution_key_enum
          WHEN LOWER(sol.slug) LIKE '%event%' THEN 'EVENTS'::solution_key_enum
          WHEN LOWER(sol.slug) LIKE '%photo%' THEN 'PHOTOGRAPHY'::solution_key_enum
          ELSE 'PRODUCTION'::solution_key_enum -- Default fallback
        END
        FROM solutions sol
        WHERE sol.id = f.solution_id
      )
      WHERE f.solution_key IS NULL
      AND f.solution_id IS NOT NULL;
    `);

    // Make solution_key NOT NULL and drop solution_id
    await queryRunner.query(`
      ALTER TABLE facilities 
      ALTER COLUMN solution_key SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE facilities 
      DROP COLUMN IF EXISTS solution_id;
    `);

    // Step 9: Drop solutions table
    await queryRunner.query(`
      DROP TABLE IF EXISTS solutions CASCADE;
    `);

    // Step 8: Drop the enum type (we'll recreate it properly via TypeORM)
    // Actually, we'll keep it since TypeORM will use it
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate solutions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS solutions (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(255),
        name VARCHAR(255),
        description TEXT,
        short_description TEXT,
        meta JSONB,
        is_published BOOLEAN NOT NULL DEFAULT false,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        featured_image VARCHAR(255),
        view_count INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_SOLUTION_SLUG ON solutions (slug);
    `);

    // Recreate solution_services junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS solution_services (
        service_id INTEGER NOT NULL,
        solution_id INTEGER NOT NULL,
        PRIMARY KEY (service_id, solution_id),
        CONSTRAINT fk_solution_services_service
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        CONSTRAINT fk_solution_services_solution
          FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE
      );
    `);

    // Recreate solution_projects junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS solution_projects (
        project_id INTEGER NOT NULL,
        solution_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, solution_id),
        CONSTRAINT fk_solution_projects_project
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_solution_projects_solution
          FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE
      );
    `);

    // Recreate facilities.solution_id
    await queryRunner.query(`
      ALTER TABLE facilities 
      ADD COLUMN IF NOT EXISTS solution_id INTEGER;
    `);

    await queryRunner.query(`
      ALTER TABLE facilities 
      ADD CONSTRAINT fk_facility_solution
        FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE;
    `);

    // Remove solution_key column from services
    await queryRunner.query(`
      ALTER TABLE services DROP COLUMN IF EXISTS solution_key;
    `);

    // Remove solution_key column from facilities
    await queryRunner.query(`
      ALTER TABLE facilities DROP COLUMN IF EXISTS solution_key;
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS solution_key_enum;
    `);
  }
}
