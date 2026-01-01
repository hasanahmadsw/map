import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOrderFromEquipmentItems1767288911989 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop order column from equipment_items table
    await queryRunner.query(`
      ALTER TABLE equipment_items 
      DROP COLUMN IF EXISTS "order";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate order column if rolling back
    await queryRunner.query(`
      ALTER TABLE equipment_items 
      ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
    `);
  }
}

