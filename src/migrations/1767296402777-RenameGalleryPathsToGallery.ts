import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameGalleryPathsToGallery1767296402777 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, transform existing data from string[] to GalleryItem[] format
    // Convert each string in the array to { path: string, order: number }
    await queryRunner.query(`
      UPDATE equipment_items
      SET gallery_paths = (
        SELECT jsonb_agg(
          jsonb_build_object(
            'path', value,
            'order', idx
          ) ORDER BY idx
        )
        FROM jsonb_array_elements_text(gallery_paths) WITH ORDINALITY AS t(value, idx)
      )
      WHERE gallery_paths IS NOT NULL 
        AND jsonb_typeof(gallery_paths) = 'array'
        AND jsonb_array_length(gallery_paths) > 0;
    `);

    // Rename the column from gallery_paths to gallery
    await queryRunner.query(`
      ALTER TABLE equipment_items
      RENAME COLUMN gallery_paths TO gallery;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename the column back from gallery to gallery_paths
    await queryRunner.query(`
      ALTER TABLE equipment_items
      RENAME COLUMN gallery TO gallery_paths;
    `);

    // Transform data back from GalleryItem[] to string[] format
    // Extract only the 'path' field from each object in the array
    await queryRunner.query(`
      UPDATE equipment_items
      SET gallery_paths = (
        SELECT jsonb_agg(elem->>'path' ORDER BY (elem->>'order')::int)
        FROM jsonb_array_elements(gallery_paths) AS elem
      )
      WHERE gallery_paths IS NOT NULL 
        AND jsonb_typeof(gallery_paths) = 'array'
        AND jsonb_array_length(gallery_paths) > 0;
    `);
  }
}
