import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './controllers/articles.controller';
import { ArticlesService } from './services/articles.service';
import { ArticlesReadService } from './services/articles-read.service';
import { ArticlesCrudService } from './services/articles-crud.service';
import { ArticleEntity } from './entities/article.entity';
import { UploadModule } from 'src/shared/modules/upload/upload.module';
import { SlugUniquenessService } from 'src/common/db/slug-uniqueness.service';
import { ViewCounterService } from 'src/common/db/view-counter.service';
import { FlagsService } from 'src/common/db/flags.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity]), UploadModule],
  controllers: [ArticlesController],
  providers: [
    SlugUniquenessService,
    ViewCounterService,
    FlagsService,
    ArticlesService,
    ArticlesReadService,
    ArticlesCrudService,
  ],
  exports: [ArticlesService],
})
export class ArticlesModule {}
