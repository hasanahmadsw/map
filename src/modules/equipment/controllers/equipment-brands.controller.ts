import { Body, Controller, Delete, Get, Patch, Post, Query, Param } from '@nestjs/common';
import { EquipmentBrandsService } from '../services/equipment-brands.service';
import { CreateEquipmentBrandDto, UpdateEquipmentBrandDto } from '../dtos/request';
import { EquipmentBrandResponseDto } from '../dtos/response';
import { EquipmentBrandFilterDto } from '../dtos/query';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

@Controller()
export class EquipmentBrandsController {
  constructor(private readonly service: EquipmentBrandsService) {}

  // ===== ADMIN =====
  @Post('admin/equipment/brands')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  @SerializeResponse(EquipmentBrandResponseDto)
  create(@Body() dto: CreateEquipmentBrandDto) {
    return this.service.create(dto);
  }

  @Get('admin/equipment/brands')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  findAll(@Query() dto: EquipmentBrandFilterDto): Promise<PaginationResponseDto<EquipmentBrandResponseDto>> {
    return this.service.findAll(dto);
  }

  @Get('admin/equipment/brands/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  @SerializeResponse(EquipmentBrandResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch('admin/equipment/brands/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  @SerializeResponse(EquipmentBrandResponseDto)
  update(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateEquipmentBrandDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/equipment/brands/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param('id', PositiveIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ===== PUBLIC =====
  @Get('equipment/brands')
  getActive(@Query() dto: PaginationDto): Promise<PaginationResponseDto<EquipmentBrandResponseDto>> {
    return this.service.getActive(dto);
  }
}
