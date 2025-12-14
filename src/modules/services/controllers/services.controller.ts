import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto } from '../dtos/request/create-service.dto';
import { UpdateServiceDto } from '../dtos/request/update-service.dto';
import { ServiceResponseDto } from '../dtos/response/service-response.dto';
import { ServiceFilterDto } from '../dtos/query/service-filter.dto';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PublicServiceFilterDto } from '../dtos/query/public-service-filter.dto';

@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('admin/services')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  create(@Body() createServiceDto: CreateServiceDto): Promise<ServiceResponseDto> {
    return this.servicesService.create(createServiceDto);
  }

  @Get('admin/services')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllForStaff(@Query() filterServiceDto: ServiceFilterDto): Promise<PaginationResponseDto<ServiceResponseDto>> {
    return this.servicesService.findAll(filterServiceDto);
  }

  @Get('admin/services/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.getById(id);
  }

  @Patch('admin/services/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete('admin/services/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', PositiveIntPipe) id: number): Promise<void> {
    this.servicesService.delete(id);
  }

  @Patch('admin/services/:id/publish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  publish(@Param('id', PositiveIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.publish(id);
  }

  @Patch('admin/services/:id/unpublish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  unpublish(@Param('id', PositiveIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.unpublish(id);
  }

  @Patch('admin/services/:id/toggle-featured')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  toggleFeatured(@Param('id', PositiveIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.toggleFeatured(id);
  }

  // ===== PUBLIC ENDPOINTS =====
  @Get('services/published')
  getPublishedServices(
    @Query() filterServiceDto: PublicServiceFilterDto,
  ): Promise<PaginationResponseDto<ServiceResponseDto>> {
    return this.servicesService.getPublishedServices(filterServiceDto);
  }

  @Get('services/featured')
  getFeaturedServices(
    @Query() filterServiceDto: PublicServiceFilterDto,
  ): Promise<PaginationResponseDto<ServiceResponseDto>> {
    return this.servicesService.getFeaturedServices(filterServiceDto);
  }

  @Get('services/slug/:slug')
  @SerializeResponse(ServiceResponseDto)
  getBySlugPublic(@Param('slug') slug: string): Promise<ServiceResponseDto> {
    return this.servicesService.getBySlugPublic(slug);
  }
}
