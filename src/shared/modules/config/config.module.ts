import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { ENV_FILES } from './env.constant';
import { EnvironmentValidator } from './env.validator';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: EnvironmentValidator.validate,
      // Only use env file if it exists, otherwise rely on environment variables (e.g., from Render)
      // NestJS ConfigModule will automatically read from process.env if envFilePath is not provided
      ...(function () {
        const envFile = ENV_FILES.getEnvFile(process.env.NODE_ENV) || ENV_FILES.DEVELOPMENT;
        const filePath = resolve(process.cwd(), 'env', envFile);
        return existsSync(filePath) ? { envFilePath: [`env/${envFile}`] } : {};
      })(),
    }),
  ],

  exports: [],
})
export class ConfigModule {}
