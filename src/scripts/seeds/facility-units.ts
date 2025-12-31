import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { FacilityUnitsService } from 'src/modules/facilities/services/facility-units.service';
import { FacilityUnitEntity } from 'src/modules/facilities/entities/facility-unit.entity';
import { CreateFacilityUnitDto } from 'src/modules/facilities/dtos/request/create-facility-unit.dto';
import { CreateFacilityUnitItemDto } from 'src/modules/facilities/dtos/request/create-facility-unit.dto';
import { FacilityUnitItemGroup } from 'src/modules/facilities/enums/facility-unit-item.enum';
import * as fs from 'fs';
import * as path from 'path';

// Group name mapping
const facilityItemGroupMap: Record<string, FacilityUnitItemGroup> = {
  // Flightcase 1
  'Video Production': FacilityUnitItemGroup.VIDEO_PRODUCTION,
  'Routing & Control': FacilityUnitItemGroup.ROUTING,
  'Playout & Graphics': FacilityUnitItemGroup.PLAYOUT_GRAPHICS,
  'Lenses & Support': FacilityUnitItemGroup.CAMERA_SUPPORT,
  'Recording & Monitoring': FacilityUnitItemGroup.RECORDING_REPLAY,
  'Audio & Intercom': FacilityUnitItemGroup.INTERCOM,
  'Networking & Audio': FacilityUnitItemGroup.NETWORKING,

  // OB Van
  'Vision Mixing & Routing': FacilityUnitItemGroup.VISION_MIXING,
  'Camera Support': FacilityUnitItemGroup.CAMERA_SUPPORT,
  'Recording & Replay': FacilityUnitItemGroup.RECORDING_REPLAY,
  'Sync & Timing': FacilityUnitItemGroup.SYNC_TIMING,
  'Control & Audio': FacilityUnitItemGroup.AUDIO,
  'RF & Wireless': FacilityUnitItemGroup.RF_WIRELESS,
  Replay: FacilityUnitItemGroup.RECORDING_REPLAY,
  Power: FacilityUnitItemGroup.POWER,
  Cabling: FacilityUnitItemGroup.CABLING,

  // Flightcase 2/3/4 + Studio 1
  'Vision Mixing': FacilityUnitItemGroup.VISION_MIXING,
  Routing: FacilityUnitItemGroup.ROUTING,
  Recording: FacilityUnitItemGroup.RECORDING_REPLAY,
  Intercom: FacilityUnitItemGroup.INTERCOM,
  Audio: FacilityUnitItemGroup.AUDIO,
  'Audio & Networking': FacilityUnitItemGroup.NETWORKING,
  'Wireless Audio': FacilityUnitItemGroup.RF_WIRELESS,
  'Studio Tools': FacilityUnitItemGroup.STUDIO_TOOLS,

  // Shared
  Cameras: FacilityUnitItemGroup.CAMERAS,
  Lenses: FacilityUnitItemGroup.LENSES,
  Monitoring: FacilityUnitItemGroup.MONITORING,
};

interface UnitItemJsonData {
  group?: string;
  title: string;
  qty?: number;
  notes?: string;
  order?: number;
}

interface UnitJsonData {
  facilityId: number;
  slug: string;
  title?: string;
  summary?: string;
  description?: string;
  specs?: any;
  coverImage?: string;
  gallery?: any;
  isPublished?: boolean;
  order?: number;
  items?: UnitItemJsonData[];
}

function mapGroupName(groupName: string | undefined): FacilityUnitItemGroup | undefined {
  if (!groupName) return undefined;
  return facilityItemGroupMap[groupName];
}

function mapItems(items: UnitItemJsonData[] | undefined): CreateFacilityUnitItemDto[] | undefined {
  if (!items || items.length === 0) return undefined;

  return items
    .map((item) => {
      const mappedGroup = mapGroupName(item.group);
      if (!mappedGroup && item.group) {
        console.warn(
          `⚠️  Warning: Unknown group "${item.group}" for item "${item.title}". Item will be created without group.`,
        );
      }

      // Only include group if it's mapped, otherwise omit it (since it's optional)
      const itemDto: CreateFacilityUnitItemDto = {
        title: item.title,
        qty: item.qty ?? undefined,
        notes: item.notes ?? undefined,
        order: item.order ?? undefined,
      };

      // Only add group if it's defined
      if (mappedGroup) {
        itemDto.group = mappedGroup;
      }

      return itemDto;
    })
    .filter((item) => item.title && item.title.trim().length > 0); // Filter out items without titles
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const facilityUnitsService = app.get(FacilityUnitsService);
  const dataSource = app.get(DataSource);

  try {
    // Read units.json file from seeds directory
    const unitsJsonPath = path.join(process.cwd(), 'src', 'scripts', 'seeds', 'units.json');
    const unitsJsonContent = fs.readFileSync(unitsJsonPath, 'utf-8');
    const unitsData: UnitJsonData[] = JSON.parse(unitsJsonContent);

    console.log(`📖 Found ${unitsData.length} facility units to seed`);

    // Delete all existing facility units
    const unitRepository = dataSource.getRepository(FacilityUnitEntity);
    const existingCount = await unitRepository.count();
    if (existingCount > 0) {
      console.log(`🗑️  Deleting ${existingCount} existing facility units...`);
      await unitRepository.clear(); // Use clear() to delete all records
      console.log(`✅ Deleted ${existingCount} existing facility units`);
    } else {
      console.log('ℹ️  No existing facility units found. Starting fresh...');
    }

    // Process each facility unit
    for (let i = 0; i < unitsData.length; i++) {
      const unitData = unitsData[i];
      console.log(`\n[${i + 1}/${unitsData.length}] Processing: ${unitData.title || unitData.slug}`);

      // Map items with group names
      const mappedItems = mapItems(unitData.items);

      // Log items info for debugging
      if (mappedItems && mappedItems.length > 0) {
        console.log(`   📦   Mapping ${mappedItems.length} items...`);
      } else if (unitData.items && unitData.items.length > 0) {
        console.warn(`   ⚠️  Warning: ${unitData.items.length} items in JSON but none mapped!`);
      }

      // Create CreateFacilityUnitDto
      const createFacilityUnitDto: CreateFacilityUnitDto = {
        facilityId: unitData.facilityId,
        slug: unitData.slug,
        title: unitData.title,
        summary: unitData.summary,
        description: unitData.description,
        specs: unitData.specs,
        coverImage: unitData.coverImage,
        gallery: unitData.gallery,
        isPublished: unitData.isPublished ?? true,
        order: unitData.order ?? 0,
        items: mappedItems, // This should now be properly mapped
      };

      try {
        const createdUnit = await facilityUnitsService.create(createFacilityUnitDto);
        console.log(`   ✅ Created facility unit: ${createdUnit.slug}`);
        if (mappedItems && mappedItems.length > 0) {
          console.log(`   📦   Items saved: ${mappedItems.length}`);
        } else {
          console.log(`   ⚠️   No items saved for this unit`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error creating facility unit ${unitData.slug}:`, errorMessage);
        if (error instanceof Error && error.stack) {
          console.error(`   Stack: ${error.stack}`);
        }
        // Continue with next unit instead of crashing
        console.log(`   ⚠️  Skipping to next facility unit...`);
        continue;
      }
    }

    console.log('\n✅ All facility units seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding facility units:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Execute seeder
bootstrap()
  .then(() => {
    console.log('\n🎉 Facility units seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Facility units seeding failed:', error);
    process.exit(1);
  });
