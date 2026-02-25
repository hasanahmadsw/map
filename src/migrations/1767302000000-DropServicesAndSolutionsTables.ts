import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to remove services and solutions from the database.
 * Drops project_services junction table, services table, and solution_key_enum.
 * The solutions table was already dropped in MigrateSolutionsToEnum.
 */
export class DropServicesAndSolutionsTables1767302000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop project_services junction table indexes (created in AddProjectIndexes)
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_project_services_project_service;
      DROP INDEX IF EXISTS idx_project_services_service_id;
      DROP INDEX IF EXISTS idx_project_services_project_id;
    `);

    // Step 2: Drop project_services junction table
    await queryRunner.query(`
      DROP TABLE IF EXISTS project_services CASCADE;
    `);

    // Step 3: Drop services table and all its data
    await queryRunner.query(`
      DROP TABLE IF EXISTS services CASCADE;
    `);

    // Step 4: Drop solution_key_enum type (was used by services.solution_key)
    await queryRunner.query(`
      DROP TYPE IF EXISTS solution_key_enum CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate solution_key_enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE solution_key_enum AS ENUM ('PRODUCTION', 'EVENTS', 'PHOTOGRAPHY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Recreate services table (empty structure - data is lost)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(255),
        name VARCHAR(255),
        description TEXT,
        short_description TEXT,
        meta JSONB,
        sub_services JSONB,
        is_published BOOLEAN NOT NULL DEFAULT false,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        featured_image VARCHAR(255),
        gallery JSONB,
        view_count INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        solution_key solution_key_enum,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_SERVICE_SLUG ON services (slug);
    `);

    // Recreate project_services junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_services (
        project_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, service_id),
        CONSTRAINT fk_project_services_project
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_project_services_service
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_project_services_project_id
        ON project_services (project_id);
      CREATE INDEX IF NOT EXISTS idx_project_services_service_id
        ON project_services (service_id);
      CREATE INDEX IF NOT EXISTS idx_project_services_project_service
        ON project_services (project_id, service_id);
    `);
  }
}
