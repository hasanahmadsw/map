import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { EquipmentBrandEntity } from 'src/modules/equipment/entities/equipment-brand.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const brandRepository = dataSource.getRepository(EquipmentBrandEntity);

    // Check if any brands already exist
    const existingBrands = await brandRepository.count();

    if (existingBrands > 0) {
      console.error('❌ Equipment brands already exist in the database. Seeding aborted.');
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      await app.close();
      return;
    }

    // Professional camera and equipment brands
    const brands: Partial<EquipmentBrandEntity>[] = [
      // ===== Tier 1 – Core Cinema =====
      { slug: 'arri', name: 'ARRI', order: 1, isActive: true },
      { slug: 'sony', name: 'Sony', order: 2, isActive: true },
      { slug: 'red', name: 'RED', order: 3, isActive: true },
      { slug: 'canon', name: 'Canon', order: 4, isActive: true },

      // ===== Tier 2 – Premium Lenses =====
      { slug: 'zeiss', name: 'Zeiss', order: 5, isActive: true },
      { slug: 'cooke-optics', name: 'Cooke Optics', order: 6, isActive: true },
      { slug: 'angenieux', name: 'Angénieux', order: 7, isActive: true },
      { slug: 'leica', name: 'Leica', order: 8, isActive: true },
      { slug: 'fujinon', name: 'Fujinon', order: 9, isActive: true },
      { slug: 'laowa', name: 'Laowa', order: 10, isActive: true },

      // ===== Tier 3 – Lighting Leaders =====
      { slug: 'aputure', name: 'Aputure', order: 11, isActive: true },
      { slug: 'astera', name: 'Astera', order: 12, isActive: true },
      { slug: 'kino-flo', name: 'Kino Flo', order: 13, isActive: true },
      { slug: 'dmg-lumiere', name: 'DMG Lumière', order: 14, isActive: true },
      { slug: 'litemat', name: 'LiteMat', order: 15, isActive: true },
      { slug: 'nanlux', name: 'Nanlux', order: 16, isActive: true },
      { slug: 'dedolight', name: 'Dedolight', order: 17, isActive: true },
      { slug: 'filmgear', name: 'Filmgear', order: 18, isActive: true },
      { slug: 'godox', name: 'Godox', order: 19, isActive: true },
      { slug: 'rosco', name: 'Rosco', order: 20, isActive: true },

      // ===== Tier 4 – Camera Support / Monitoring / Wireless =====
      { slug: 'teradek', name: 'Teradek', order: 21, isActive: true },
      { slug: 'smallhd', name: 'SmallHD', order: 22, isActive: true },
      { slug: 'tvlogic', name: 'TVLogic', order: 23, isActive: true },
      { slug: 'atomos', name: 'Atomos', order: 24, isActive: true },
      { slug: 'hollyland', name: 'Hollyland', order: 25, isActive: true },
      { slug: 'transvideo', name: 'Transvideo', order: 26, isActive: true },
      { slug: 'pix', name: 'Pix', order: 27, isActive: true },
      { slug: 'seetec', name: 'Seetec', order: 28, isActive: true },

      // ===== Tier 5 – Motion / Grip / Stabilization =====
      { slug: 'oconnor', name: 'OConnor', order: 29, isActive: true },
      { slug: 'sachtler', name: 'Sachtler', order: 30, isActive: true },
      { slug: 'cartoni', name: 'Cartoni', order: 31, isActive: true },
      { slug: 'chapman', name: 'Chapman', order: 32, isActive: true },
      { slug: 'panther', name: 'Panther', order: 33, isActive: true },
      { slug: 'ronford-baker', name: 'Ronford Baker', order: 34, isActive: true },
      { slug: 'gfm', name: 'GFM', order: 35, isActive: true },
      { slug: 'flowcine', name: 'Flowcine', order: 36, isActive: true },
      { slug: 'easyrig', name: 'EasyRig', order: 37, isActive: true },
      { slug: 'ready-rig', name: 'Ready Rig', order: 38, isActive: true },
      { slug: 'jimmy-jib', name: 'Jimmy Jib', order: 39, isActive: true },

      // ===== Tier 6 – Control / Accessories =====
      { slug: 'tilta', name: 'Tilta', order: 40, isActive: true },
      { slug: 'chrosziel', name: 'Chrosziel', order: 41, isActive: true },
      { slug: 'c-motion', name: 'C-Motion', order: 42, isActive: true },
      { slug: 'tiffen', name: 'Tiffen', order: 43, isActive: true },
      { slug: 'schneider', name: 'Schneider', order: 44, isActive: true },
      { slug: 'tls', name: 'TLS', order: 45, isActive: true },

      // ===== Tier 7 – Consumer / Action / Vehicles =====
      { slug: 'dji', name: 'DJI', order: 46, isActive: true },
      { slug: 'gopro', name: 'GoPro', order: 47, isActive: true },
      { slug: 'panasonic', name: 'Panasonic', order: 48, isActive: true },
      { slug: 'manfrotto', name: 'Manfrotto', order: 49, isActive: true },
      { slug: 'deniz', name: 'Deniz', order: 50, isActive: true },
      { slug: 'polaris', name: 'Polaris', order: 51, isActive: true },
      { slug: 'gmc', name: 'GMC', order: 52, isActive: true },
    ];

    const savedBrands = await brandRepository.save(brands);
    console.log(`✅ Successfully seeded ${savedBrands.length} equipment brands`);

    await queryRunner.commitTransaction();
    console.log('✨ Transaction committed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding equipment brands:', error);
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
    console.log('✨ Equipment brands seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Equipment brands seeder failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
