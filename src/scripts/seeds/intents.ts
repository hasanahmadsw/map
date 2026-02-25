import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { IntentEntity } from 'src/modules/intent/entities/intent.entity';
import { IntentType } from 'src/modules/intent/types/intent-type.enum';

interface IntentJsonData {
  slug: string;
  type: string;
  parentSlug: string | null;
  h1?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  subHeading?: string;
  content?: string;
  linkLabel?: string;
  equipmentFilters?: Record<string, unknown>;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const intentRepository = dataSource.getRepository(IntentEntity);

    // Check if any intents already exist
    const existingIntents = await intentRepository.count();

    if (existingIntents > 0) {
      console.error('❌ Intents already exist in the database. Seeding aborted.');
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      await app.close();
      return;
    }

    // Read intents.json file
    const intentsJsonPath = path.join(process.cwd(), 'src/scripts/seeds/intents.json');
    const intentsJsonContent = fs.readFileSync(intentsJsonPath, 'utf-8');
    const intentsData: IntentJsonData[] = JSON.parse(intentsJsonContent);

    console.log(`📁 Found ${intentsData.length} intents to seed`);

    const slugToIdMap = new Map<string, number>();

    for (const item of intentsData) {
      const parentId = item.parentSlug ? slugToIdMap.get(item.parentSlug) ?? null : null;

      const entity = intentRepository.create({
        slug: item.slug,
        type: item.type as IntentType,
        parentId,
        h1: item.h1 ?? null,
        metaTitle: item.metaTitle ?? null,
        metaDescription: item.metaDescription ?? null,
        metaKeywords: item.metaKeywords ?? null,
        subHeading: item.subHeading ?? null,
        content: item.content ?? null,
        linkLabel: item.linkLabel ?? null,
        equipmentFilters: item.equipmentFilters ?? null,
      });

      const saved = await intentRepository.save(entity);
      slugToIdMap.set(item.slug, saved.id);
    }

    console.log(`✅ Successfully seeded ${intentsData.length} intents`);

    await queryRunner.commitTransaction();
    console.log('✨ Transaction committed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding intents:', error);
    console.error('Transaction rolled back');
    throw error;
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

// Execute seeder
bootstrap()
  .then(() => {
    console.log('✨ Intents seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Intents seeder failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
