import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ArticlesService } from '../services/articles.service';
import { CreateArticleDto } from '../dtos/request/create-article.dto';
import { UpdateArticleDto } from '../dtos/request/update-article.dto';
import { ArticleResponseDto } from '../dtos/response/article-response.dto';
import { ArticleFilterDto } from '../dtos/query/article-filter.dto';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PublicArticleFilterDto } from '../dtos/query/public-article-filter.dto';
import { CurrentStaff } from 'src/common/decorators/staff.decorator';
import { StaffEntity } from 'src/modules/staff/entities/staff.entity';

@Controller()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('admin/articles')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ArticleResponseDto)
  create(@CurrentStaff() author: StaffEntity, @Body() createArticleDto: CreateArticleDto): Promise<ArticleResponseDto> {
    return this.articlesService.create(author, createArticleDto);
  }

  @Get('admin/articles')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllForStaff(@Query() filterArticleDto: ArticleFilterDto): Promise<PaginationResponseDto<ArticleResponseDto>> {
    return this.articlesService.findAll(filterArticleDto);
  }

  @Get('admin/articles/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ArticleResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number): Promise<ArticleResponseDto> {
    return this.articlesService.getById(id);
  }

  @Patch('admin/articles/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ArticleResponseDto)
  update(
    @Param('id', PositiveIntPipe) id: number,
    @CurrentStaff() author: StaffEntity,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.update(id, author, updateArticleDto);
  }

  @Delete('admin/articles/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', PositiveIntPipe) id: number, @CurrentStaff() author: StaffEntity): Promise<void> {
    this.articlesService.delete(id, author);
  }

  // ===== PUBLIC ENDPOINTS =====
  @Get('articles/published')
  getPublishedArticles(
    @Query() filterArticleDto: PublicArticleFilterDto,
  ): Promise<PaginationResponseDto<ArticleResponseDto>> {
    return this.articlesService.getPublishedArticles(filterArticleDto);
  }

  @Get('articles/featured')
  getFeaturedArticles(
    @Query() filterArticleDto: PublicArticleFilterDto,
  ): Promise<PaginationResponseDto<ArticleResponseDto>> {
    return this.articlesService.getFeaturedArticles(filterArticleDto);
  }

  @Get('articles/slug/:slug')
  @SerializeResponse(ArticleResponseDto)
  getBySlugPublic(@Param('slug') slug: string): Promise<ArticleResponseDto> {
    return this.articlesService.getBySlugPublic(slug);
  }

  @Get('articles/slug/:slug/related')
  @SerializeResponse(ArticleResponseDto)
  findRelatedArticles(@Param('slug') slug: string): Promise<ArticleResponseDto[]> {
    return this.articlesService.findRelatedArticles(slug);
  }
}
