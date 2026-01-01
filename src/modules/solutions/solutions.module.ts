import { Module } from '@nestjs/common';
import { SolutionsController } from './controllers/solutions.controller';
import { SolutionsConfigService } from './services/solutions-config.service';

@Module({
  controllers: [SolutionsController],
  providers: [SolutionsConfigService],
  exports: [SolutionsConfigService],
})
export class SolutionsModule {}
