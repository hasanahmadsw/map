import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './controllers/services.controller';
import { ServicesService } from './services/services.service';
import { ServicesReadService } from './services/services-read.service';
import { ServicesCrudService } from './services/services-crud.service';
import { ServiceEntity } from './entities/service.entity';
import { SolutionEntity } from '../solutions/entities/solution.entity';
import { UploadModule } from 'src/shared/modules/upload/upload.module';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { FlagsService } from 'src/common/db/flags.service';
import { JunctionSyncService } from 'src/common/db/junction-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity, SolutionEntity]), UploadModule],
  controllers: [ServicesController],
  providers: [
    SlugUniquenessService,
    ViewCounterService,
    FlagsService,
    JunctionSyncService,
    ServicesService,
    ServicesReadService,
    ServicesCrudService,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
