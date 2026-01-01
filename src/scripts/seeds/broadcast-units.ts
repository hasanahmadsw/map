import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { BroadcastUnitsService } from 'src/modules/broadcast/services/broadcast-units.service';
import { BroadcastUnitEntity } from 'src/modules/broadcast/entities/broadcast-unit.entity';
import { CreateBroadcastUnitDto } from 'src/modules/broadcast/dtos/request/create-broadcast-unit.dto';
import { CreateBroadcastUnitItemDto } from 'src/modules/broadcast/dtos/request/create-broadcast-unit.dto';
import { BroadcastUnitItemGroup } from 'src/modules/broadcast/enums/broadcast-unit-item.enum';
import { BroadcastType } from 'src/modules/broadcast/enums/broadcast-type.enum';
import * as fs from 'fs';
import * as path from 'path';

// Group name mapping
const broadcastItemGroupMap: Record<string, BroadcastUnitItemGroup> = {
  // Flightcase 1
  'Video Production': BroadcastUnitItemGroup.VIDEO_PRODUCTION,
  'Routing & Control': BroadcastUnitItemGroup.ROUTING,
  'Playout & Graphics': BroadcastUnitItemGroup.PLAYOUT_GRAPHICS,
  'Lenses & Support': BroadcastUnitItemGroup.CAMERA_SUPPORT,
  'Recording & Monitoring': BroadcastUnitItemGroup.RECORDING_REPLAY,
  'Audio & Intercom': BroadcastUnitItemGroup.INTERCOM,
  'Networking & Audio': BroadcastUnitItemGroup.NETWORKING,

  // OB Van
  'Vision Mixing & Routing': BroadcastUnitItemGroup.VISION_MIXING,
  'Camera Support': BroadcastUnitItemGroup.CAMERA_SUPPORT,
  'Recording & Replay': BroadcastUnitItemGroup.RECORDING_REPLAY,
  'Sync & Timing': BroadcastUnitItemGroup.SYNC_TIMING,
  'Control & Audio': BroadcastUnitItemGroup.AUDIO,
  'RF & Wireless': BroadcastUnitItemGroup.RF_WIRELESS,
  Replay: BroadcastUnitItemGroup.RECORDING_REPLAY,
  Power: BroadcastUnitItemGroup.POWER,
  Cabling: BroadcastUnitItemGroup.CABLING,

  // Flightcase 2/3/4 + Studio 1
  'Vision Mixing': BroadcastUnitItemGroup.VISION_MIXING,
  Routing: BroadcastUnitItemGroup.ROUTING,
  Recording: BroadcastUnitItemGroup.RECORDING_REPLAY,
  Intercom: BroadcastUnitItemGroup.INTERCOM,
  Audio: BroadcastUnitItemGroup.AUDIO,
  'Audio & Networking': BroadcastUnitItemGroup.NETWORKING,
  'Wireless Audio': BroadcastUnitItemGroup.RF_WIRELESS,
  'Studio Tools': BroadcastUnitItemGroup.STUDIO_TOOLS,

  // Shared
  Cameras: BroadcastUnitItemGroup.CAMERAS,
  Lenses: BroadcastUnitItemGroup.LENSES,
  Monitoring: BroadcastUnitItemGroup.MONITORING,
};

interface UnitItemJsonData {
  group?: string;
  title: string;
  qty?: number;
  notes?: string;
  order?: number;
}

interface UnitJsonData {
  type: BroadcastType;
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

function mapGroupName(groupName: string | undefined): BroadcastUnitItemGroup | undefined {
  if (!groupName) return undefined;
  return broadcastItemGroupMap[groupName];
}

function mapItems(items: UnitItemJsonData[] | undefined): CreateBroadcastUnitItemDto[] | undefined {
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
      const itemDto: CreateBroadcastUnitItemDto = {
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
  const broadcastUnitsService = app.get(BroadcastUnitsService);
  const dataSource = app.get(DataSource);

  try {
    // Read broadcast-units.json file from seeds directory
    const unitsJsonPath = path.join(process.cwd(), 'src', 'scripts', 'seeds', 'broadcast-units.json');
    const unitsJsonContent = fs.readFileSync(unitsJsonPath, 'utf-8');
    const unitsData: UnitJsonData[] = JSON.parse(unitsJsonContent);

    console.log(`📖 Found ${unitsData.length} broadcast units to seed`);

    // Delete all existing broadcast units
    const unitRepository = dataSource.getRepository(BroadcastUnitEntity);
    const existingCount = await unitRepository.count();
    if (existingCount > 0) {
      console.log(`🗑️  Deleting ${existingCount} existing broadcast units...`);
      await unitRepository.clear(); // Use clear() to delete all records
      console.log(`✅ Deleted ${existingCount} existing broadcast units`);
    } else {
      console.log('ℹ️  No existing broadcast units found. Starting fresh...');
    }

    // Process each broadcast unit
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

      // Create CreateBroadcastUnitDto
      const createBroadcastUnitDto: CreateBroadcastUnitDto = {
        type: unitData.type,
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
        const createdUnit = await broadcastUnitsService.create(createBroadcastUnitDto);
        console.log(`   ✅ Created broadcast unit: ${createdUnit.slug}`);
        if (mappedItems && mappedItems.length > 0) {
          console.log(`   📦   Items saved: ${mappedItems.length}`);
        } else {
          console.log(`   ⚠️   No items saved for this unit`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error creating broadcast unit ${unitData.slug}:`, errorMessage);
        if (error instanceof Error && error.stack) {
          console.error(`   Stack: ${error.stack}`);
        }
        // Continue with next unit instead of crashing
        console.log(`   ⚠️  Skipping to next broadcast unit...`);
        continue;
      }
    }

    console.log('\n✅ All broadcast units seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding broadcast units:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Execute seeder
bootstrap()
  .then(() => {
    console.log('\n🎉 Broadcast units seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Broadcast units seeding failed:', error);
    process.exit(1);
  });
