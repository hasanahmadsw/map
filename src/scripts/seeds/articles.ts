import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ArticlesService } from 'src/modules/articles/services/articles.service';
import { CreateArticleDto } from 'src/modules/articles/dtos/request/create-article.dto';
import { DataSource } from 'typeorm';
import { StaffEntity } from 'src/modules/staff/entities/staff.entity';
import { StaffRole } from 'src/modules/staff/enums/staff-role.enums';
import * as fs from 'fs';
import * as path from 'path';

interface ArticleJsonData {
  slug: string;
  image?: string;
  name: string;
  content: string;
  excerpt?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  topics?: string[];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const articlesService = app.get(ArticlesService);
  const dataSource = app.get(DataSource);

  try {
    // Read articles.json file
    const articlesJsonPath = path.join(process.cwd(), 'articles.json');
    const articlesJsonContent = fs.readFileSync(articlesJsonPath, 'utf-8');
    const articlesData: ArticleJsonData[] = JSON.parse(articlesJsonContent);

    console.log(`📖 Found ${articlesData.length} articles to seed`);

    // Check if any articles already exist
    const existingArticles = await articlesService.findAll({ page: 1, limit: 1 });
    if (existingArticles.pagination.total > 0) {
      console.log('⚠️  Articles already exist in the database.');
      console.log('   If you want to re-seed, please delete existing articles first.');
      await app.close();
      return;
    }

    // Get a staff member to use as author (prefer AUTHOR role, fall back to ADMIN, then SUPERADMIN)
    const staffRepository = dataSource.getRepository(StaffEntity);
    let author = await staffRepository.findOne({
      where: { role: StaffRole.AUTHOR },
    });

    if (!author) {
      author = await staffRepository.findOne({
        where: { role: StaffRole.ADMIN },
      });
    }

    if (!author) {
      author = await staffRepository.findOne({
        where: { role: StaffRole.SUPERADMIN },
      });
    }

    if (!author) {
      console.error('❌ No staff members found. Please run the staff seeder first.');
      await app.close();
      return;
    }

    console.log(`👤 Using author: ${author.name} (${author.email})`);

    // Process each article
    for (let i = 0; i < articlesData.length; i++) {
      const articleData = articlesData[i];
      console.log(`\n[${i + 1}/${articlesData.length}] Processing: ${articleData.name}`);

      // Create CreateArticleDto
      const createArticleDto: CreateArticleDto = {
        slug: articleData.slug,
        image: articleData.image,
        name: articleData.name,
        content: articleData.content,
        excerpt: articleData.excerpt,
        meta: articleData.meta,
        isPublished: articleData.isPublished ?? true,
        isFeatured: articleData.isFeatured ?? false,
        tags: articleData.tags ?? [],
        topics: articleData.topics ?? [],
      };

      try {
        const createdArticle = await articlesService.create(author, createArticleDto);
        console.log(`   ✅ Created article: ${createdArticle.slug}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error creating article ${articleData.slug}:`, errorMessage);
        // Continue with next article instead of crashing
        console.log(`   ⚠️  Skipping to next article...`);
        continue;
      }
    }

    console.log('\n✅ All articles seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding articles:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Execute seeder
bootstrap()
  .then(() => {
    console.log('\n🎉 Articles seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Articles seeding failed:', error);
    process.exit(1);
  });
