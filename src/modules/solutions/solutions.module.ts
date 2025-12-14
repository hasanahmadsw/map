import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolutionsController } from './controllers/solutions.controller';
import { SolutionsService } from './services/solutions.service';
import { SolutionEntity } from './entities/solution.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { UploadModule } from 'src/shared/modules/upload/upload.module';
import { SolutionsReadService } from './services/solutions-read.service';
import { SolutionsCrudService } from './services/solutions-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { FlagsService } from 'src/common/db/flags.service';

@Module({
  imports: [TypeOrmModule.forFeature([SolutionEntity, ServiceEntity]), UploadModule],
  controllers: [SolutionsController],
  providers: [
    SlugUniquenessService,
    ViewCounterService,
    FlagsService,
    SolutionsService,
    SolutionsReadService,
    SolutionsCrudService,
  ],
  exports: [SolutionsService],
})
export class SolutionsModule {}
