import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { SolutionsService } from 'src/modules/solutions/services/solutions.service';
import { CreateSolutionDto } from 'src/modules/solutions/dtos/request/create-solution.dto';
import * as fs from 'fs';
import * as path from 'path';

interface SolutionJsonData {
  slug: string;
  icon?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isPublished?: boolean;
  isFeatured?: boolean;
  featuredImage?: string;
  order?: number;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const solutionsService = app.get(SolutionsService);

  try {
    // Read solutions.json file
    const solutionsJsonPath = path.join(process.cwd(), 'solutions.json');
    const solutionsJsonContent = fs.readFileSync(solutionsJsonPath, 'utf-8');
    const solutionsData: SolutionJsonData[] = JSON.parse(solutionsJsonContent);

    console.log(`📖 Found ${solutionsData.length} solutions to seed`);

    // Check if any solutions already exist
    const existingSolutions = await solutionsService.findAll({ page: 1, limit: 1 });
    if (existingSolutions.pagination.total > 0) {
      console.log('⚠️  Solutions already exist in the database.');
      console.log('   If you want to re-seed, please delete existing solutions first.');
      await app.close();
      return;
    }

    // Process each solution
    for (let i = 0; i < solutionsData.length; i++) {
      const solutionData = solutionsData[i];
      console.log(`\n[${i + 1}/${solutionsData.length}] Processing: ${solutionData.name}`);

      // Create CreateSolutionDto
      const createSolutionDto: CreateSolutionDto = {
        slug: solutionData.slug,
        icon: solutionData.icon,
        name: solutionData.name,
        description: solutionData.description,
        shortDescription: solutionData.shortDescription,
        meta: solutionData.meta,
        isPublished: solutionData.isPublished ?? true,
        isFeatured: solutionData.isFeatured ?? false,
        featuredImage: solutionData.featuredImage,
        order: solutionData.order ?? 0,
      };

      try {
        const createdSolution = await solutionsService.create(createSolutionDto);
        console.log(`   ✅ Created solution: ${createdSolution.slug}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error creating solution ${solutionData.slug}:`, errorMessage);
        // Continue with next solution instead of crashing
        console.log(`   ⚠️  Skipping to next solution...`);
        continue;
      }
    }

    console.log('\n✅ All solutions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding solutions:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Execute seeder
bootstrap()
  .then(() => {
    console.log('\n🎉 Solutions seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Solutions seeding failed:', error);
    process.exit(1);
  });
