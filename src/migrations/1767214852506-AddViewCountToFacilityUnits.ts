import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViewCountToFacilityUnits1767214852506 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add view_count column to facility_units table
    await queryRunner.query(`
      ALTER TABLE public.facility_units
      ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove view_count column from facility_units table
    await queryRunner.query(`
      ALTER TABLE public.facility_units
      DROP COLUMN IF EXISTS view_count;
    `);
  }
}
