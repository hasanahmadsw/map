import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { SettingEntity } from 'src/modules/settings/entities/setting.entity';
import { MetaConfig, SocialLink, AnalyticsConfig, ContactInfo, CustomScripts } from 'src/modules/settings/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const settingRepository = queryRunner.manager.getRepository(SettingEntity);

    // Check if any settings already exist
    const existingSettings = await settingRepository.count();

    if (existingSettings > 0) {
      console.error('❌ Settings already exist in the database. Seeding aborted.');
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      await app.close();
      return;
    }

    // Default settings data
    const defaultSettings: Partial<SettingEntity> = {
      siteName: 'MAP Media Art Production',
      siteDescription:
        'MAP Media Art Production is a leading media production company in the UAE, Saudi Arabia, and the Middle East.',
      siteLogo: '/images/logo.png',
      siteDarkLogo: '/images/logo-dark.png',
      siteFavicon: '/images/favicon.ico',
      defaultLanguage: 'en',
      meta: {
        title: 'MAP Media Art Production - Home',
        description:
          'MAP Media Art Production is a leading media production company in the UAE, Saudi Arabia, and the Middle East.',
        keywords: [
          'MAP Media Art Production',
          'media production',
          'media production company',
          'media production services',
          'media production agency',
          'media production company in the UAE',
          'media production company in Saudi Arabia',
          'media production company in the Middle East',
        ],
      } as MetaConfig,
      social: [
        {
          platform: 'facebook',
          url: 'https://facebook.com/mapmediaproduction',
          label: 'Facebook',
        },
        {
          platform: 'twitter',
          url: 'https://twitter.com/mapmediaproduction',
          label: 'Twitter',
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/company/mapmediaproduction',
          label: 'LinkedIn',
        },
        {
          platform: 'instagram',
          url: 'https://instagram.com/mapmediaproduction',
          label: 'Instagram',
        },
      ] as SocialLink[],
      analytics: {
        googleAnalytics: 'GA_MEASUREMENT_ID',
        facebookPixel: 'FB_PIXEL_ID',
        customScripts: [],
      } as AnalyticsConfig,
      contact: {
        email: 'contact@mapmediaproduction.com',
        phone: '+971 50 123 4567',
        address: 'Dubai, UAE',
        workingHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
      } as ContactInfo,
      customScripts: {
        header: [],
        footer: [],
      } as CustomScripts,
    };

    // Save the main settings
    const savedSettings = await settingRepository.save(defaultSettings);
    console.log('✅ Settings saved successfully');

    await queryRunner.commitTransaction();
    console.log('Transaction committed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error seeding settings:', error);
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
    console.log('✨ Settings seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Settings seeder failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
