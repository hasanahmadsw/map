import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadModule } from 'src/shared/modules/upload/upload.module';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { FlagsService } from 'src/common/db/flags.service';

import { BroadcastUnitEntity } from './entities/broadcast-unit.entity';

import { BroadcastUnitsController } from './controllers/broadcast-units.controller';

import { BroadcastUnitsService } from './services/broadcast-units.service';
import { BroadcastUnitsReadService } from './services/broadcast-units-read.service';
import { BroadcastUnitsCrudService } from './services/broadcast-units-crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([BroadcastUnitEntity]), UploadModule],
  controllers: [BroadcastUnitsController],
  providers: [
    SlugUniquenessService,
    ViewCounterService,
    FlagsService,

    BroadcastUnitsService,
    BroadcastUnitsReadService,
    BroadcastUnitsCrudService,
  ],
  exports: [BroadcastUnitsService],
})
export class BroadcastModule {}
