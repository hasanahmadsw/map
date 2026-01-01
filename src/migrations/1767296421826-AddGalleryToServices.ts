import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGalleryToServices1767296421826 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add gallery column to services table
    await queryRunner.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS gallery JSONB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove gallery column from services table
    await queryRunner.query(`
      ALTER TABLE services
      DROP COLUMN IF EXISTS gallery;
    `);
  }
}
