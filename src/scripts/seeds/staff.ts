import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { StaffEntity } from 'src/modules/staff/entities/staff.entity';
import { StaffRole } from 'src/modules/staff/enums/staff-role.enums';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const staffRepository = queryRunner.manager.getRepository(StaffEntity);

    // Check if any staff already exists
    const existingStaff = await staffRepository.count();

    if (existingStaff > 0) {
      console.error('❌ Staff already exist in the database. Seeding aborted.');
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      await app.close();
      return;
    }

    const staff: Partial<StaffEntity>[] = [
      {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: await bcrypt.hash('Superadmin1', 10),
        role: StaffRole.SUPERADMIN,
        bio: 'System administrator with full access to all features and settings.',
      },
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin1', 10),
        role: StaffRole.ADMIN,
        bio: 'Administrator with access to content management and user administration.',
      },
      {
        name: 'Author',
        email: 'author@example.com',
        password: await bcrypt.hash('Author1', 10),
        role: StaffRole.AUTHOR,
        bio: 'Content author responsible for creating and managing articles and content.',
      },
    ];

    const savedStaff = await staffRepository.save(staff);
    console.log(`Successfully seeded ${savedStaff.length} staff`);

    await queryRunner.commitTransaction();
    console.log('Transaction committed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error seeding staff:', error);
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
    console.log('✨ Staff seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Staff seeder failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
