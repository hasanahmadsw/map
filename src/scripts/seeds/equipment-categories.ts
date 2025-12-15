import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { EquipmentCategoryEntity } from 'src/modules/equipment/entities/equipment-category.entity';
import { EquipmentType } from 'src/modules/equipment/types/equipment.enums';
import * as fs from 'fs';
import * as path from 'path';

interface CategoryJsonData {
  slug: string;
  name: string;
  description?: string;
  type: string;
  order: number;
  isActive: boolean;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const categoryRepository = dataSource.getRepository(EquipmentCategoryEntity);

    // Check if any categories already exist
    const existingCategories = await categoryRepository.count();

    if (existingCategories > 0) {
      console.error('❌ Equipment categories already exist in the database. Seeding aborted.');
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      await app.close();
      return;
    }

    // Read categories.json file
    const categoriesJsonPath = path.join(process.cwd(), 'src/scripts/seeds/categories.json');
    const categoriesJsonContent = fs.readFileSync(categoriesJsonPath, 'utf-8');
    const categoriesData: CategoryJsonData[] = JSON.parse(categoriesJsonContent);

    console.log(`📁 Found ${categoriesData.length} categories to seed`);

    // Map JSON data to entity structure
    const categories: Partial<EquipmentCategoryEntity>[] = categoriesData.map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      description: cat.description ?? null,
      type: cat.type as EquipmentType,
      order: cat.order,
      isActive: cat.isActive,
    }));

    const savedCategories = await categoryRepository.save(categories);
    console.log(`✅ Successfully seeded ${savedCategories.length} equipment categories`);

    await queryRunner.commitTransaction();
    console.log('✨ Transaction committed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding equipment categories:', error);
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
    console.log('✨ Equipment categories seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Equipment categories seeder failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
