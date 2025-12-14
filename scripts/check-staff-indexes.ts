import 'reflect-metadata';
import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ENV_FILES } from '../src/shared/modules/config/env.constant';

// Load environment variables
const envFile = ENV_FILES.getEnvFile(process.env.NODE_ENV) || ENV_FILES.DEVELOPMENT;
config({ path: resolve(process.cwd(), `env/${envFile}`) });

async function checkIndexes() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  });

  await dataSource.initialize();

  console.log('\n=== Checking Staff Indexes ===\n');

  // Check indexes
  const indexes = await dataSource.query(`
    SELECT 
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE tablename IN ('staff', 'staff_translations')
      AND schemaname = 'public'
    ORDER BY tablename, indexname;
  `);

  console.log(`Found ${indexes.length} indexes:\n`);

  const expectedIndexes = {
    staff: [
      'idx_staff_created_desc',
      'idx_staff_role_created_desc',
      'idx_staff_password_changed_at',
      'idx_staff_name_trgm',
    ],
    staff_translations: [
      'idx_staff_translations_staff_id',
      'idx_staff_translations_lang_staff',
      'idx_staff_translations_default_per_staff',
      'idx_staff_translations_name_trgm',
      'idx_staff_translations_bio_trgm',
    ],
  };

  const foundIndexes = {
    staff: [] as string[],
    staff_translations: [] as string[],
  };

  indexes.forEach((idx: any) => {
    foundIndexes[idx.tablename as keyof typeof foundIndexes].push(idx.indexname);
    console.log(`✓ ${idx.tablename}.${idx.indexname}`);
    console.log(`  ${idx.indexdef}\n`);
  });

  // Check for missing indexes
  console.log('\n=== Missing Indexes Check ===\n');
  let hasMissing = false;

  expectedIndexes.staff.forEach((expectedIdx) => {
    if (!foundIndexes.staff.includes(expectedIdx)) {
      console.log(`✗ MISSING: staff.${expectedIdx}`);
      hasMissing = true;
    }
  });

  expectedIndexes.staff_translations.forEach((expectedIdx) => {
    if (!foundIndexes.staff_translations.includes(expectedIdx)) {
      console.log(`✗ MISSING: staff_translations.${expectedIdx}`);
      hasMissing = true;
    }
  });

  if (!hasMissing) {
    console.log('✓ All expected indexes are present!\n');
  }

  // Analyze query execution plan
  console.log('\n=== Query Execution Plan Analysis ===\n');
  const explainQuery = `
    EXPLAIN ANALYZE
    SELECT DISTINCT staff.id, staff.created_at
    FROM staff
    LEFT JOIN staff_translations ON staff_translations.staff_id = staff.id
    ORDER BY staff.created_at DESC, staff.id ASC
    LIMIT 10;
  `;

  const plan = await dataSource.query(explainQuery);
  console.log('Execution Plan for IDs Query:');
  plan.forEach((row: any) => {
    console.log(row['QUERY PLAN']);
  });

  await dataSource.destroy();
}

checkIndexes()
  .then(() => {
    console.log('\n✓ Index check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Error:', error);
    process.exit(1);
  });

