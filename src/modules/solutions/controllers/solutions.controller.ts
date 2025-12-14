import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { SolutionsService } from '../services/solutions.service';
import { CreateSolutionDto } from '../dtos/request/create-solution.dto';
import { UpdateSolutionDto } from '../dtos/request/update-solution.dto';
import { SolutionResponseDto } from '../dtos/response/solution-response.dto';
import { SolutionFilterDto } from '../dtos/query/solution-filter.dto';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PublicSolutionFilterDto } from '../dtos/query/public-solution-filter.dto';

@Controller()
export class SolutionsController {
  constructor(private readonly solutionsService: SolutionsService) {}

  @Post('admin/solutions')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(SolutionResponseDto)
  create(@Body() createSolutionDto: CreateSolutionDto): Promise<SolutionResponseDto> {
    return this.solutionsService.create(createSolutionDto);
  }

  @Get('admin/solutions')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllForStaff(@Query() filterSolutionDto: SolutionFilterDto): Promise<PaginationResponseDto<SolutionResponseDto>> {
    return this.solutionsService.findAll(filterSolutionDto);
  }

  @Get('admin/solutions/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(SolutionResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number): Promise<SolutionResponseDto> {
    return this.solutionsService.getById(id);
  }

  @Patch('admin/solutions/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(SolutionResponseDto)
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() updateSolutionDto: UpdateSolutionDto,
  ): Promise<SolutionResponseDto> {
    return this.solutionsService.update(id, updateSolutionDto);
  }

  @Delete('admin/solutions/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', PositiveIntPipe) id: number): Promise<void> {
    this.solutionsService.delete(id);
  }

  @Patch('admin/solutions/:id/publish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(SolutionResponseDto)
  publish(@Param('id', PositiveIntPipe) id: number): Promise<SolutionResponseDto> {
    return this.solutionsService.publish(id);
  }

  @Patch('admin/solutions/:id/unpublish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(SolutionResponseDto)
  unpublish(@Param('id', PositiveIntPipe) id: number): Promise<SolutionResponseDto> {
    return this.solutionsService.unpublish(id);
  }

  @Patch('admin/solutions/:id/toggle-featured')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(SolutionResponseDto)
  toggleFeatured(@Param('id', PositiveIntPipe) id: number): Promise<SolutionResponseDto> {
    return this.solutionsService.toggleFeatured(id);
  }

  // ===== PUBLIC ENDPOINTS =====
  @Get('solutions/published')
  getPublishedSolutions(
    @Query() filterSolutionDto: PublicSolutionFilterDto,
  ): Promise<PaginationResponseDto<SolutionResponseDto>> {
    return this.solutionsService.getPublishedSolutions(filterSolutionDto);
  }

  @Get('solutions/featured')
  getFeaturedSolutions(
    @Query() filterSolutionDto: PublicSolutionFilterDto,
  ): Promise<PaginationResponseDto<SolutionResponseDto>> {
    return this.solutionsService.getFeaturedSolutions(filterSolutionDto);
  }

  @Get('solutions/slug/:slug')
  @SerializeResponse(SolutionResponseDto)
  getBySlugPublic(@Param('slug') slug: string): Promise<SolutionResponseDto> {
    return this.solutionsService.getBySlugPublic(slug);
  }
}
