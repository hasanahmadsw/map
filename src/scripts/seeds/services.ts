import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ServicesService } from 'src/modules/services/services/services.service';
import { CreateServiceDto } from 'src/modules/services/dtos/request/create-service.dto';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceJsonData {
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
  subServices?: Array<{
    name: string;
    description?: string;
  }>;
  isPublished?: boolean;
  isFeatured?: boolean;
  featuredImage?: string;
  order?: number;
  solutionIds?: number[];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const servicesService = app.get(ServicesService);

  try {
    // Read services.json file
    const servicesJsonPath = path.join(process.cwd(), 'services.json');
    const servicesJsonContent = fs.readFileSync(servicesJsonPath, 'utf-8');
    const servicesData: ServiceJsonData[] = JSON.parse(servicesJsonContent);

    console.log(`📖 Found ${servicesData.length} services to seed`);

    // Check if any services already exist
    // const existingServices = await servicesService.findAll({ page: 1, limit: 1 });
    // if (existingServices.pagination.total > 0) {
    //   console.log('⚠️  Services already exist in the database.');
    //   console.log('   If you want to re-seed, please delete existing services first.');
    //   await app.close();
    //   return;
    // }

    // Process each service
    for (let i = 0; i < servicesData.length; i++) {
      const serviceData = servicesData[i];
      console.log(`\n[${i + 1}/${servicesData.length}] Processing: ${serviceData.name}`);

      // Transform subServices: map 'name' to 'title' to match the DTO interface
      const subServices = serviceData.subServices?.map((subService) => ({
        title: subService.name,
        description: subService.description,
      }));

      // Create CreateServiceDto
      const createServiceDto: CreateServiceDto = {
        slug: serviceData.slug,
        icon: serviceData.icon,
        name: serviceData.name,
        description: serviceData.description,
        shortDescription: serviceData.shortDescription,
        meta: serviceData.meta,
        subServices: subServices,
        isPublished: serviceData.isPublished ?? true,
        isFeatured: serviceData.isFeatured ?? false,
        featuredImage: serviceData.featuredImage,
        order: serviceData.order ?? 0,
        solutionIds: serviceData.solutionIds,
      };

      try {
        const createdService = await servicesService.create(createServiceDto);
        console.log(`   ✅ Created service: ${createdService.slug}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error creating service ${serviceData.slug}:`, errorMessage);
        // Continue with next service instead of crashing
        console.log(`   ⚠️  Skipping to next service...`);
        continue;
      }
    }

    console.log('\n✅ All services seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Execute seeder
bootstrap()
  .then(() => {
    console.log('\n🎉 Services seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Services seeding failed:', error);
    process.exit(1);
  });
