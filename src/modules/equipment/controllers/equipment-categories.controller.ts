import { Body, Controller, Delete, Get, Patch, Post, Query, Param } from '@nestjs/common';
import { EquipmentCategoriesService } from '../services/equipment-categories.service';
import { CreateEquipmentCategoryDto, UpdateEquipmentCategoryDto } from '../dtos/request';
import { EquipmentCategoryResponseDto } from '../dtos/response';
import { EquipmentCategoryFilterDto } from '../dtos/query';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

@Controller()
export class EquipmentCategoriesController {
  constructor(private readonly service: EquipmentCategoriesService) {}

  @Post('admin/equipment/categories')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  @SerializeResponse(EquipmentCategoryResponseDto)
  create(@Body() dto: CreateEquipmentCategoryDto) {
    return this.service.create(dto);
  }

  @Get('admin/equipment/categories')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  findAll(@Query() dto: EquipmentCategoryFilterDto): Promise<PaginationResponseDto<EquipmentCategoryResponseDto>> {
    return this.service.findAll(dto);
  }

  @Get('admin/equipment/categories/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  @SerializeResponse(EquipmentCategoryResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch('admin/equipment/categories/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  @SerializeResponse(EquipmentCategoryResponseDto)
  update(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateEquipmentCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete('admin/equipment/categories/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param('id', PositiveIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ===== PUBLIC =====
  @Get('equipment/categories')
  getActive(@Query() dto: PaginationDto): Promise<PaginationResponseDto<EquipmentCategoryResponseDto>> {
    return this.service.getActive(dto);
  }
}
