import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { FacilitiesService } from 'src/modules/facilities/services/facilities.service';
import { CreateFacilityDto } from 'src/modules/facilities/dtos/request/create-facility.dto';
import { FacilityType } from 'src/modules/facilities/enums/facility-type.enum';
import * as fs from 'fs';
import * as path from 'path';

interface FacilityJsonData {
  solutionId: number;
  type: FacilityType;
  slug: string;
  title?: string;
  summary?: string;
  description?: string;
  coverImage?: string;
  gallery?: any;
  isPublished?: boolean;
  order?: number;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const facilitiesService = app.get(FacilitiesService);

  try {
    // Read facilities.json file from seeds directory
    const facilitiesJsonPath = path.join(process.cwd(), 'src', 'scripts', 'seeds', 'facilities.json');
    const facilitiesJsonContent = fs.readFileSync(facilitiesJsonPath, 'utf-8');
    const facilitiesData: FacilityJsonData[] = JSON.parse(facilitiesJsonContent);

    console.log(`📖 Found ${facilitiesData.length} facilities to seed`);

    // Check if any facilities already exist
    const existingFacilities = await facilitiesService.findAll({ page: 1, limit: 1 });
    if (existingFacilities.pagination.total > 0) {
      console.log('⚠️  Facilities already exist in the database.');
      console.log('   If you want to re-seed, please delete existing facilities first.');
      await app.close();
      return;
    }

    // Process each facility
    for (let i = 0; i < facilitiesData.length; i++) {
      const facilityData = facilitiesData[i];
      console.log(`\n[${i + 1}/${facilitiesData.length}] Processing: ${facilityData.title || facilityData.slug}`);

      // Create CreateFacilityDto
      const createFacilityDto: CreateFacilityDto = {
        solutionId: facilityData.solutionId,
        type: facilityData.type,
        slug: facilityData.slug,
        title: facilityData.title,
        summary: facilityData.summary,
        description: facilityData.description,
        coverImage: facilityData.coverImage,
        gallery: facilityData.gallery,
        isPublished: facilityData.isPublished ?? true,
        order: facilityData.order ?? 0,
      };

      try {
        const createdFacility = await facilitiesService.create(createFacilityDto);
        console.log(`   ✅ Created facility: ${createdFacility.slug}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error creating facility ${facilityData.slug}:`, errorMessage);
        // Continue with next facility instead of crashing
        console.log(`   ⚠️  Skipping to next facility...`);
        continue;
      }
    }

    console.log('\n✅ All facilities seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding facilities:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Execute seeder
bootstrap()
  .then(() => {
    console.log('\n🎉 Facilities seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Facilities seeding failed:', error);
    process.exit(1);
  });
