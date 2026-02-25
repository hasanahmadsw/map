import { MigrationInterface, QueryRunner } from 'typeorm';

export class BroadcastUnitRemoveCoverDescAddMeta1767301000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE broadcast_units DROP COLUMN IF EXISTS cover_image`);
    await queryRunner.query(`ALTER TABLE broadcast_units DROP COLUMN IF EXISTS description`);
    await queryRunner.query(`ALTER TABLE broadcast_units ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE broadcast_units ADD COLUMN IF NOT EXISTS meta_description TEXT`);
    await queryRunner.query(`ALTER TABLE broadcast_units ADD COLUMN IF NOT EXISTS meta_keywords TEXT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE broadcast_units DROP COLUMN IF EXISTS meta_title`);
    await queryRunner.query(`ALTER TABLE broadcast_units DROP COLUMN IF EXISTS meta_description`);
    await queryRunner.query(`ALTER TABLE broadcast_units DROP COLUMN IF EXISTS meta_keywords`);
    await queryRunner.query(`ALTER TABLE broadcast_units ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE broadcast_units ADD COLUMN IF NOT EXISTS description TEXT`);
  }
}
