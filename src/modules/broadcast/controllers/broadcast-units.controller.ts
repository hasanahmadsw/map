import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { Protected } from 'src/common/decorators/roles.decorator';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

import { BroadcastUnitsService } from '../services/broadcast-units.service';

import { CreateBroadcastUnitDto } from '../dtos/request/create-broadcast-unit.dto';
import { UpdateBroadcastUnitDto } from '../dtos/request/update-broadcast-unit.dto';
import { BroadcastUnitResponseDto } from '../dtos/response/broadcast-unit-response.dto';
import { BroadcastUnitFilterDto } from '../dtos/query/broadcast-unit-filter.dto';
import { PublicBroadcastUnitFilterDto } from '../dtos/query/public-broadcast-unit-filter.dto';

@Controller()
export class BroadcastUnitsController {
  constructor(private readonly units: BroadcastUnitsService) {}

  // ================= ADMIN: FACILITY UNITS =================
  @Post('admin/broadcast-units')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(BroadcastUnitResponseDto)
  createUnit(@Body() dto: CreateBroadcastUnitDto) {
    return this.units.create(dto);
  }

  @Get('admin/broadcast-units')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllUnits(@Query() dto: BroadcastUnitFilterDto): Promise<PaginationResponseDto<BroadcastUnitResponseDto>> {
    return this.units.findAll(dto);
  }

  @Get('admin/broadcast-units/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(BroadcastUnitResponseDto)
  getUnit(@Param('id', PositiveIntPipe) id: number) {
    return this.units.getById(id);
  }

  @Patch('admin/broadcast-units/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(BroadcastUnitResponseDto)
  updateUnit(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateBroadcastUnitDto) {
    return this.units.update(id, dto);
  }

  @Delete('admin/broadcast-units/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUnit(@Param('id', PositiveIntPipe) id: number) {
    return this.units.delete(id);
  }

  @Patch('admin/broadcast-units/:id/publish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(BroadcastUnitResponseDto)
  publishUnit(@Param('id', PositiveIntPipe) id: number) {
    return this.units.publish(id);
  }

  @Patch('admin/broadcast-units/:id/unpublish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(BroadcastUnitResponseDto)
  unpublishUnit(@Param('id', PositiveIntPipe) id: number) {
    return this.units.unpublish(id);
  }

  // ================= PUBLIC =================
  @Get('broadcast-units/published')
  getPublishedUnits(
    @Query() dto: PublicBroadcastUnitFilterDto,
  ): Promise<PaginationResponseDto<BroadcastUnitResponseDto>> {
    return this.units.getPublished(dto);
  }

  @Get('broadcast-units/slug/:slug')
  @SerializeResponse(BroadcastUnitResponseDto)
  getBroadcastUnitBySlugPublic(@Param('slug') slug: string) {
    return this.units.findBySlug(slug);
  }
}
