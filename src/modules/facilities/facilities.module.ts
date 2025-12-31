import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadModule } from 'src/shared/modules/upload/upload.module';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { FlagsService } from 'src/common/db/flags.service';

import { FacilityEntity } from './entities/facility.entity';
import { FacilityUnitEntity } from './entities/facility-unit.entity';
import { SolutionEntity } from 'src/modules/solutions/entities/solution.entity';

import { FacilitiesController } from './controllers/facilities.controller';
import { FacilityUnitsController } from './controllers/facility-units.controller';

import { FacilitiesService } from './services/facilities.service';
import { FacilitiesReadService } from './services/facilities-read.service';
import { FacilitiesCrudService } from './services/facilities-crud.service';

import { FacilityUnitsService } from './services/facility-units.service';
import { FacilityUnitsReadService } from './services/facility-units-read.service';
import { FacilityUnitsCrudService } from './services/facility-units-crud.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolutionEntity, // because public filter might join solution slug (optional)
      FacilityEntity,
      FacilityUnitEntity,
    ]),
    UploadModule,
  ],
  controllers: [FacilitiesController, FacilityUnitsController],
  providers: [
    SlugUniquenessService,
    ViewCounterService,
    FlagsService,

    FacilitiesService,
    FacilitiesReadService,
    FacilitiesCrudService,

    FacilityUnitsService,
    FacilityUnitsReadService,
    FacilityUnitsCrudService,
  ],
  exports: [FacilitiesService],
})
export class FacilitiesModule {}
