import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';
import { ProjectsReadService } from './services/projects-read.service';
import { ProjectsCrudService } from './services/projects-crud.service';
import { ProjectEntity } from './entities/project.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { UploadModule } from '../../shared/modules/upload/upload.module';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { FlagsService } from 'src/common/db/flags.service';
import { JunctionSyncService } from 'src/common/db/junction-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, ServiceEntity]), UploadModule],
  controllers: [ProjectsController],
  providers: [
    SlugUniquenessService,
    ViewCounterService,
    FlagsService,
    JunctionSyncService,
    ProjectsService,
    ProjectsReadService,
    ProjectsCrudService,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
