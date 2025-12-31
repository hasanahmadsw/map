import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViewCountToFacilities1767195392117 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add view_count column to facilities table
    await queryRunner.query(`
      ALTER TABLE public.facilities
      ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove view_count column from facilities table
    await queryRunner.query(`
      ALTER TABLE public.facilities
      DROP COLUMN IF EXISTS view_count;
    `);
  }
}
