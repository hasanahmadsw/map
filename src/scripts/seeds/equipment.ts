import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { EquipmentItemEntity } from 'src/modules/equipment/entities/equipment-item.entity';
import { EquipmentCategoryEntity } from 'src/modules/equipment/entities/equipment-category.entity';
import { EquipmentBrandEntity } from 'src/modules/equipment/entities/equipment-brand.entity';
import { EquipmentType } from 'src/modules/equipment/types/equipment.enums';
import { validateEquipmentSpecsOrThrow } from 'src/modules/equipment/specs/equipment-specs.validator';
import * as fs from 'fs';
import * as path from 'path';

interface EquipmentJsonData {
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  categoryId: number;
  brandId: number;
  equipmentType: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  order?: number;
  specs?: Record<string, any>;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  // Ensure DataSource is initialized and entities are loaded
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Use queryRunner's manager to get repositories within transaction context
    const equipmentRepository = queryRunner.manager.getRepository(EquipmentItemEntity);
    const categoryRepository = queryRunner.manager.getRepository(EquipmentCategoryEntity);
    const brandRepository = queryRunner.manager.getRepository(EquipmentBrandEntity);

    // Read equipment.json file
    const equipmentJsonPath = path.join(process.cwd(), 'src/scripts/seeds/equipment.lenses.json');
    const equipmentJsonContent = fs.readFileSync(equipmentJsonPath, 'utf-8');
    const equipmentData: EquipmentJsonData[] = JSON.parse(equipmentJsonContent);

    console.log(`📁 Found ${equipmentData.length} equipment items to seed`);

    // Get all categories and brands to validate references
    const categories = await categoryRepository.find();
    const brands = await brandRepository.find();

    const categoryIds = new Set(categories.map((c) => c.id));
    const brandIds = new Set(brands.map((b) => b.id));

    // Filter out invalid entries and prepare equipment items
    const validEquipment: Partial<EquipmentItemEntity>[] = [];
    let skippedCount = 0;

    for (const item of equipmentData) {
      // Skip entries with invalid categoryId or brandId (0 or not found)
      if (!item.categoryId || !item.brandId || item.categoryId === 0 || item.brandId === 0) {
        console.warn(`⚠️  Skipping ${item.slug}: Invalid categoryId (${item.categoryId}) or brandId (${item.brandId})`);
        skippedCount++;
        continue;
      }

      if (!categoryIds.has(item.categoryId)) {
        console.warn(`⚠️  Skipping ${item.slug}: Category ID ${item.categoryId} not found`);
        skippedCount++;
        continue;
      }

      if (!brandIds.has(item.brandId)) {
        console.warn(`⚠️  Skipping ${item.slug}: Brand ID ${item.brandId} not found`);
        skippedCount++;
        continue;
      }

      // Validate specs if provided
      let validatedSpecs = null;
      if (item.specs) {
        try {
          validatedSpecs = validateEquipmentSpecsOrThrow(item.equipmentType as EquipmentType, item.specs);
        } catch (error) {
          console.warn(
            `⚠️  Skipping ${item.slug}: Invalid specs - ${error instanceof Error ? error.message : String(error)}`,
          );
          skippedCount++;
          continue;
        }
      }

      // Map JSON data to entity structure
      validEquipment.push({
        slug: item.slug,
        name: item.name,
        summary: item.summary ?? null,
        description: item.description ?? null,
        categoryId: item.categoryId,
        brandId: item.brandId,
        equipmentType: item.equipmentType as EquipmentType,
        isPublished: item.isPublished ?? false,
        isFeatured: item.isFeatured ?? false,
        specs: validatedSpecs,
      });
    }

    if (skippedCount > 0) {
      console.log(`⚠️  Skipped ${skippedCount} invalid equipment items`);
    }

    if (validEquipment.length === 0) {
      console.error('❌ No valid equipment items to seed');
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      await app.close();
      return;
    }

    console.log(`📦 Preparing to seed ${validEquipment.length} equipment items...`);

    const savedEquipment = await equipmentRepository.save(validEquipment);
    console.log(`✅ Successfully seeded ${savedEquipment.length} equipment items`);

    await queryRunner.commitTransaction();
    console.log('✨ Transaction committed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding equipment:', error);
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
    console.log('✨ Equipment seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Equipment seeder failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
