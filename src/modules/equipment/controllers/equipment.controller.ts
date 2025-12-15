import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { EquipmentService } from '../services/equipment.service';

import { CreateEquipmentDto, UpdateEquipmentDto } from '../dtos/request';
import { EquipmentResponseDto } from '../dtos/response';
import { EquipmentFilterDto, PublicEquipmentFilterDto } from '../dtos/query';

import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';

import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller()
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  // ===== ADMIN ENDPOINTS =====

  @Post('admin/equipment')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(EquipmentResponseDto)
  create(@Body() dto: CreateEquipmentDto): Promise<EquipmentResponseDto> {
    return this.equipmentService.create(dto);
  }

  @Get('admin/equipment')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAllForStaff(@Query() dto: EquipmentFilterDto): Promise<PaginationResponseDto<EquipmentResponseDto>> {
    return this.equipmentService.findAll(dto);
  }

  @Get('admin/equipment/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(EquipmentResponseDto)
  getById(@Param('id', PositiveIntPipe) id: number): Promise<EquipmentResponseDto> {
    return this.equipmentService.getById(id);
  }

  @Patch('admin/equipment/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(EquipmentResponseDto)
  update(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateEquipmentDto): Promise<EquipmentResponseDto> {
    return this.equipmentService.update(id, dto);
  }

  @Delete('admin/equipment/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', PositiveIntPipe) id: number): Promise<void> {
    return this.equipmentService.delete(id);
  }

  @Patch('admin/equipment/:id/publish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(EquipmentResponseDto)
  publish(@Param('id', PositiveIntPipe) id: number): Promise<EquipmentResponseDto> {
    return this.equipmentService.publish(id);
  }

  @Patch('admin/equipment/:id/unpublish')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(EquipmentResponseDto)
  unpublish(@Param('id', PositiveIntPipe) id: number): Promise<EquipmentResponseDto> {
    return this.equipmentService.unpublish(id);
  }

  @Patch('admin/equipment/:id/toggle-featured')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(EquipmentResponseDto)
  toggleFeatured(@Param('id', PositiveIntPipe) id: number): Promise<EquipmentResponseDto> {
    return this.equipmentService.toggleFeatured(id);
  }

  // ===== PUBLIC ENDPOINTS =====

  @Get('equipment/published')
  getPublished(@Query() dto: PublicEquipmentFilterDto): Promise<PaginationResponseDto<EquipmentResponseDto>> {
    return this.equipmentService.getPublished(dto);
  }

  @Get('equipment/featured')
  getFeatured(@Query() dto: PublicEquipmentFilterDto): Promise<PaginationResponseDto<EquipmentResponseDto>> {
    return this.equipmentService.getFeatured(dto);
  }

  @Get('equipment/slug/:slug')
  @SerializeResponse(EquipmentResponseDto)
  getBySlugPublic(@Param('slug') slug: string): Promise<EquipmentResponseDto> {
    return this.equipmentService.getBySlugPublic(slug);
  }
}
