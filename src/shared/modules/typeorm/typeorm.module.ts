import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentConfig } from '../config/env.schema';
import { Environment } from '../config/env.constant';
import { Client } from 'pg';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      async useFactory(configService: ConfigService<EnvironmentConfig>) {
        await createDatabaseIfNotExists(configService);

        const isDev = configService.get<string>('NODE_ENV') !== Environment.PRODUCTION;

        return {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST'),
          port: parseInt(configService.get('POSTGRES_PORT'), 10),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DATABASE'),
          entities: ['dist/**/*.entity{.ts,.js}'],

          // Connection pooling configuration to reduce query overhead
          extra: {
            max: 20, // Maximum number of connections in the pool
            min: 5, // Minimum number of connections in the pool
            idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
            // Enable statement timeout to prevent long-running queries
            statement_timeout: 30000, // 30 seconds
          },

          // ...(!isDev
          //   ? {
          //       ssl: {
          //         rejectUnauthorized: false,
          //       },
          //     }
          //   : {}),

          synchronize: false, // Always false - use migrations instead to preserve indexes
          logging: isDev, // Enable logging in development for debugging
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

async function createDatabaseIfNotExists(configService: ConfigService<EnvironmentConfig>) {
  const client = new Client({
    host: configService.get('POSTGRES_HOST'),
    port: parseInt(configService.get('POSTGRES_PORT'), 10),
    user: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: 'postgres',
  });

  try {
    await client.connect();

    const dbName = configService.get('POSTGRES_DATABASE');

    const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully.`);
    } else {
      // console.log(`✅ Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('❌ Error creating database:', error);
  } finally {
    await client.end();
  }
}
