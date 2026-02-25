import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntentsTable1767300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE public.intent_type_enum AS ENUM (
        'HUB', 'CLUSTER', 'CATEGORY', 'BRAND', 'MODEL', 'OFFER', 'LOCATION'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.intents (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        type intent_type_enum NOT NULL,
        parent_id INTEGER,
        h1 VARCHAR(500),
        meta_title VARCHAR(500),
        meta_description TEXT,
        meta_keywords TEXT,
        sub_heading VARCHAR(500),
        content TEXT,
        link_label VARCHAR(255),
        equipment_filters JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_intent_parent
          FOREIGN KEY (parent_id)
          REFERENCES public.intents(id)
          ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_INTENT_SLUG ON public.intents (slug);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_INTENT_TYPE ON public.intents (type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_INTENT_PARENT ON public.intents (parent_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_INTENT_PARENT;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_INTENT_TYPE;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_INTENT_SLUG;`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.intents CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS public.intent_type_enum;`);
  }
}
