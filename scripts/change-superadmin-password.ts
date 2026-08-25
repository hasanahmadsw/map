import 'reflect-metadata';
import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ENV_FILES } from '../src/shared/modules/config/env.constant';
import { StaffEntity } from '../src/modules/staff/entities/staff.entity';

const SUPERADMIN_EMAIL = 'superadmin@example.com';

const envFile = ENV_FILES.getEnvFile(process.env.NODE_ENV) || ENV_FILES.DEVELOPMENT;
config({ path: resolve(process.cwd(), `env/${envFile}`) });

function getPasswordFromArgs(): string {
  const passwordFlagIndex = process.argv.indexOf('--password');
  if (passwordFlagIndex !== -1) {
    const password = process.argv[passwordFlagIndex + 1];
    if (!password || password.startsWith('--')) {
      throw new Error('Missing value for --password');
    }
    return password;
  }

  const password = process.env.SUPERADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      'Password is required. Pass --password <new-password> or set SUPERADMIN_PASSWORD.',
    );
  }

  return password;
}

async function changeSuperadminPassword() {
  const newPassword = getPasswordFromArgs();

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: [StaffEntity],
  });

  await dataSource.initialize();

  const staffRepository = dataSource.getRepository(StaffEntity);
  const staff = await staffRepository.findOne({ where: { email: SUPERADMIN_EMAIL } });

  if (!staff) {
    throw new Error(`Staff account not found for ${SUPERADMIN_EMAIL}`);
  }

  staff.password = newPassword;
  await staffRepository.save(staff);

  console.log(`Password updated for ${SUPERADMIN_EMAIL}`);

  await dataSource.destroy();
}

changeSuperadminPassword()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to change superadmin password:', error.message);
    process.exit(1);
  });
