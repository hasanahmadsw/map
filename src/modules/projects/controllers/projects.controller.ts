import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dtos/request/create-project.dto';
import { UpdateProjectDto } from '../dtos/request/update-project.dto';
import { ProjectResponseDto } from '../dtos/response/project-response.dto';
import { ProjectFilterDto } from '../dtos/query/project-filter.dto';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PublicProjectFilterDto } from '../dtos/query/public-project-filter.dto';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('admin/projects')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ProjectResponseDto)
  create(@Body() createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.projectsService.create(createProjectDto);
  }

  @Get('admin/projects')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllForStaff(@Query() filterProjectDto: ProjectFilterDto): Promise<PaginationResponseDto<ProjectResponseDto>> {
    return this.projectsService.findAll(filterProjectDto);
  }

  @Get('admin/projects/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ProjectResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number): Promise<ProjectResponseDto> {
    return this.projectsService.getById(id);
  }

  @Patch('admin/projects/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ProjectResponseDto)
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete('admin/projects/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', PositiveIntPipe) id: number): Promise<void> {
    this.projectsService.delete(id);
  }

  @Patch('admin/projects/:id/publish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ProjectResponseDto)
  publish(@Param('id', PositiveIntPipe) id: number): Promise<ProjectResponseDto> {
    return this.projectsService.publish(id);
  }

  @Patch('admin/projects/:id/unpublish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ProjectResponseDto)
  unpublish(@Param('id', PositiveIntPipe) id: number): Promise<ProjectResponseDto> {
    return this.projectsService.unpublish(id);
  }

  @Patch('admin/projects/:id/toggle-featured')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ProjectResponseDto)
  toggleFeatured(@Param('id', PositiveIntPipe) id: number): Promise<ProjectResponseDto> {
    return this.projectsService.toggleFeatured(id);
  }

  // ===== PUBLIC ENDPOINTS =====
  @Get('projects/published')
  getPublishedProjects(
    @Query() filterProjectDto: PublicProjectFilterDto,
  ): Promise<PaginationResponseDto<ProjectResponseDto>> {
    return this.projectsService.getPublishedProjects(filterProjectDto);
  }

  @Get('projects/featured')
  getFeaturedProjects(
    @Query() filterProjectDto: PublicProjectFilterDto,
  ): Promise<PaginationResponseDto<ProjectResponseDto>> {
    return this.projectsService.getFeaturedProjects(filterProjectDto);
  }

  @Get('projects/slug/:slug')
  @SerializeResponse(ProjectResponseDto)
  getBySlugPublic(@Param('slug') slug: string): Promise<ProjectResponseDto> {
    return this.projectsService.getBySlugPublic(slug);
  }
}
