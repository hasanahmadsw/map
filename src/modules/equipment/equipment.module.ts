import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadModule } from 'src/shared/modules/upload/upload.module';

import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { FlagsService } from 'src/common/db/flags.service';

import { EquipmentController } from './controllers/equipment.controller';
import { EquipmentBrandsController } from './controllers/equipment-brands.controller';
import { EquipmentCategoriesController } from './controllers/equipment-categories.controller';

import { EquipmentService } from './services/equipment.service';
import { EquipmentReadService } from './services/equipment-read.service';
import { EquipmentCrudService } from './services/equipment-crud.service';
import { EquipmentBrandsService } from './services/equipment-brands.service';
import { EquipmentBrandsReadService } from './services/equipment-brands-read.service';
import { EquipmentBrandsCrudService } from './services/equipment-brands-crud.service';
import { EquipmentCategoriesService } from './services/equipment-categories.service';
import { EquipmentCategoriesReadService } from './services/equipment-categories-read.service';
import { EquipmentCategoriesCrudService } from './services/equipment-categories-crud.service';

import { EquipmentItemEntity } from './entities/equipment-item.entity';
import { EquipmentCategoryEntity } from './entities/equipment-category.entity';
import { EquipmentBrandEntity } from './entities/equipment-brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EquipmentItemEntity, EquipmentCategoryEntity, EquipmentBrandEntity]),
    UploadModule,
  ],
  controllers: [EquipmentBrandsController, EquipmentCategoriesController, EquipmentController],
  providers: [
    SlugUniquenessService,
    ViewCounterService,
    FlagsService,

    EquipmentService,
    EquipmentReadService,
    EquipmentCrudService,

    EquipmentBrandsService,
    EquipmentBrandsReadService,
    EquipmentBrandsCrudService,

    EquipmentCategoriesService,
    EquipmentCategoriesReadService,
    EquipmentCategoriesCrudService,
  ],
  exports: [EquipmentService],
})
export class EquipmentModule {}
