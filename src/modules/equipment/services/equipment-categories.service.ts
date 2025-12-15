import { Injectable } from '@nestjs/common';
import { EquipmentCategoriesReadService } from './equipment-categories-read.service';
import { EquipmentCategoriesCrudService } from './equipment-categories-crud.service';
import { CreateEquipmentCategoryDto } from '../dtos/request/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from '../dtos/request/update-equipment-category.dto';
import { EquipmentCategoryFilterDto } from '../dtos/query/equipment-category-filter.dto';
import { EquipmentCategoryResponseDto } from '../dtos/response/equipment-category-response.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

@Injectable()
export class EquipmentCategoriesService {
  constructor(
    private readonly read: EquipmentCategoriesReadService,
    private readonly crud: EquipmentCategoriesCrudService,
  ) {}

  create(dto: CreateEquipmentCategoryDto) {
    return this.crud.create(dto);
  }

  findAll(dto: EquipmentCategoryFilterDto): Promise<PaginationResponseDto<EquipmentCategoryResponseDto>> {
    return this.read.findAll(dto);
  }

  findOne(id: number) {
    return this.read.findOne(id);
  }

  update(id: number, dto: UpdateEquipmentCategoryDto) {
    return this.crud.update(id, dto);
  }

  remove(id: number) {
    return this.crud.remove(id);
  }

  getActive(dto: PaginationDto): Promise<PaginationResponseDto<EquipmentCategoryResponseDto>> {
    return this.read.getActive(dto);
  }
}
