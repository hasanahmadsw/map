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

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  create(@Body() createServiceDto: CreateServiceDto): Promise<ServiceResponseDto> {
    return this.servicesService.create(createServiceDto);
  }

  @Get('staff')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllForStaff(@Query() filterServiceDto: ServiceFilterDto): Promise<PaginationResponseDto<ServiceResponseDto>> {
    return this.servicesService.findAll(filterServiceDto);
  }

  @Get('staff/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.getById(id);
  }

  @Patch(':id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', PositiveIntPipe) id: number): Promise<void> {
    this.servicesService.delete(id);
  }

  @Patch(':id/publish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  publish(@Param('id', PositiveIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.publish(id);
  }

  @Patch(':id/unpublish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  unpublish(@Param('id', PositiveIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.unpublish(id);
  }

  @Patch(':id/toggle-featured')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(ServiceResponseDto)
  toggleFeatured(@Param('id', PositiveIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.toggleFeatured(id);
  }

  // ===== PUBLIC ENDPOINTS =====
  @Get('published')
  getPublishedServices(
    @Query() filterServiceDto: PublicServiceFilterDto,
  ): Promise<PaginationResponseDto<ServiceResponseDto>> {
    return this.servicesService.getPublishedServices(filterServiceDto);
  }

  @Get('featured')
  getFeaturedServices(
    @Query() filterServiceDto: PublicServiceFilterDto,
  ): Promise<PaginationResponseDto<ServiceResponseDto>> {
    return this.servicesService.getFeaturedServices(filterServiceDto);
  }

  @Get('slug/:slug')
  @SerializeResponse(ServiceResponseDto)
  getBySlugPublic(@Param('slug') slug: string): Promise<ServiceResponseDto> {
    return this.servicesService.getBySlugPublic(slug);
  }
}
