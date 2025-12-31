import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { Protected } from 'src/common/decorators/roles.decorator';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

import { FacilitiesService } from '../services/facilities.service';

import { CreateFacilityDto } from '../dtos/request/create-facility.dto';
import { UpdateFacilityDto } from '../dtos/request/update-facility.dto';
import { FacilityResponseDto } from '../dtos/response/facility-response.dto';
import { FacilityFilterDto } from '../dtos/query/facility-filter.dto';
import { PublicFacilityFilterDto } from '../dtos/query/public-facility-filter.dto';

@Controller()
export class FacilitiesController {
  constructor(private readonly facilities: FacilitiesService) {}

  // ================= ADMIN: FACILITIES =================
  @Post('admin/facilities')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityResponseDto)
  createFacility(@Body() dto: CreateFacilityDto): Promise<FacilityResponseDto> {
    return this.facilities.create(dto);
  }

  @Get('admin/facilities')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllFacilities(@Query() dto: FacilityFilterDto): Promise<PaginationResponseDto<FacilityResponseDto>> {
    return this.facilities.findAll(dto);
  }

  @Get('admin/facilities/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityResponseDto)
  getFacility(@Param('id', PositiveIntPipe) id: number): Promise<FacilityResponseDto> {
    return this.facilities.getById(id);
  }

  @Patch('admin/facilities/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityResponseDto)
  updateFacility(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateFacilityDto) {
    return this.facilities.update(id, dto);
  }

  @Delete('admin/facilities/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFacility(@Param('id', PositiveIntPipe) id: number) {
    return this.facilities.delete(id);
  }

  @Patch('admin/facilities/:id/publish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityResponseDto)
  publishAsset(@Param('id', PositiveIntPipe) id: number) {
    return this.facilities.publish(id);
  }

  @Patch('admin/facilities/:id/unpublish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityResponseDto)
  unpublishFacility(@Param('id', PositiveIntPipe) id: number) {
    return this.facilities.unpublish(id);
  }

  // ================= PUBLIC =================
  @Get('facilities/published')
  getPublished(@Query() dto: PublicFacilityFilterDto) {
    return this.facilities.getPublished(dto);
  }

  @Get('facilities/slug/:slug')
  @SerializeResponse(FacilityResponseDto)
  getBySlugPublic(@Param('slug') slug: string) {
    return this.facilities.getBySlugPublic(slug);
  }
}
