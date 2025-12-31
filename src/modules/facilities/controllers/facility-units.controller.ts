import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { Protected } from 'src/common/decorators/roles.decorator';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

import { FacilityUnitsService } from '../services/facility-units.service';

import { CreateFacilityUnitDto } from '../dtos/request/create-facility-unit.dto';
import { UpdateFacilityUnitDto } from '../dtos/request/update-facility-unit.dto';
import { FacilityUnitResponseDto } from '../dtos/response/facility-unit-response.dto';
import { FacilityUnitFilterDto } from '../dtos/query/facility-unit-filter.dto';
import { PublicFacilityUnitFilterDto } from '../dtos/query/public-facility-unit-filter.dto';

@Controller()
export class FacilityUnitsController {
  constructor(private readonly units: FacilityUnitsService) {}

  // ================= ADMIN: FACILITY UNITS =================
  @Post('admin/facility-units')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityUnitResponseDto)
  createUnit(@Body() dto: CreateFacilityUnitDto) {
    return this.units.create(dto);
  }

  @Get('admin/facility-units')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllUnits(@Query() dto: FacilityUnitFilterDto): Promise<PaginationResponseDto<FacilityUnitResponseDto>> {
    return this.units.findAll(dto);
  }

  @Get('admin/facility-units/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityUnitResponseDto)
  getUnit(@Param('id', PositiveIntPipe) id: number) {
    return this.units.getById(id);
  }

  @Patch('admin/facility-units/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityUnitResponseDto)
  updateUnit(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateFacilityUnitDto) {
    return this.units.update(id, dto);
  }

  @Delete('admin/facility-units/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUnit(@Param('id', PositiveIntPipe) id: number) {
    return this.units.delete(id);
  }

  @Patch('admin/facility-units/:id/publish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityUnitResponseDto)
  publishUnit(@Param('id', PositiveIntPipe) id: number) {
    return this.units.publish(id);
  }

  @Patch('admin/facility-units/:id/unpublish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(FacilityUnitResponseDto)
  unpublishUnit(@Param('id', PositiveIntPipe) id: number) {
    return this.units.unpublish(id);
  }

  // ================= PUBLIC =================
  @Get('facility-units/published')
  getPublishedUnits(
    @Query() dto: PublicFacilityUnitFilterDto,
  ): Promise<PaginationResponseDto<FacilityUnitResponseDto>> {
    return this.units.getPublished(dto);
  }

  @Get('facility-units/slug/:slug')
  @SerializeResponse(FacilityUnitResponseDto)
  getUnitBySlugPublic(@Param('slug') slug: string) {
    return this.units.findBySlug(slug);
  }
}
