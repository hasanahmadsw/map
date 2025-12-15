import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEquipmentCategoriesRemoveParentAddType1765788173239 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE public.equipment_categories
      DROP CONSTRAINT IF EXISTS fk_equipment_category_parent;
    `);

    // Drop index on parent_id
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_equipment_categories_parent_id;
    `);

    // Drop parent_id column
    await queryRunner.query(`
      ALTER TABLE public.equipment_categories
      DROP COLUMN IF EXISTS parent_id;
    `);

    // Create enum type for equipment type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE equipment_type_enum AS ENUM ('camera', 'lens', 'light', 'audio', 'accessory');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add type column
    await queryRunner.query(`
      ALTER TABLE public.equipment_categories
      ADD COLUMN IF NOT EXISTS type equipment_type_enum NOT NULL DEFAULT 'camera';
    `);

    // Remove default after adding column (since it's required)
    await queryRunner.query(`
      ALTER TABLE public.equipment_categories
      ALTER COLUMN type DROP DEFAULT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove type column
    await queryRunner.query(`
      ALTER TABLE public.equipment_categories
      DROP COLUMN IF EXISTS type;
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS equipment_type_enum;
    `);

    // Add parent_id column back
    await queryRunner.query(`
      ALTER TABLE public.equipment_categories
      ADD COLUMN IF NOT EXISTS parent_id INTEGER;
    `);

    // Create index on parent_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_categories_parent_id
      ON public.equipment_categories (parent_id);
    `);

    // Add foreign key constraint back
    await queryRunner.query(`
      ALTER TABLE public.equipment_categories
      ADD CONSTRAINT fk_equipment_category_parent
      FOREIGN KEY (parent_id)
      REFERENCES public.equipment_categories(id)
      ON DELETE SET NULL;
    `);
  }
}
