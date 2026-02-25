import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntentEntity } from './entities/intent.entity';
import { IntentController } from './controllers/intent.controller';
import { IntentService } from './services/intent.service';
import { IntentReadService } from './services/intent-read.service';
import { IntentCrudService } from './services/intent-crud.service';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IntentEntity]),
    PaginationModule,
  ],
  controllers: [IntentController],
  providers: [
    SlugUniquenessService,
    IntentService,
    IntentReadService,
    IntentCrudService,
  ],
  exports: [IntentService],
})
export class IntentModule {}
