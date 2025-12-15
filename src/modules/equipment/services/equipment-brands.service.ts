import { Injectable } from '@nestjs/common';
import { EquipmentBrandsReadService } from './equipment-brands-read.service';
import { EquipmentBrandsCrudService } from './equipment-brands-crud.service';
import { CreateEquipmentBrandDto, UpdateEquipmentBrandDto } from '../dtos/request';
import { EquipmentBrandFilterDto } from '../dtos/query';
import { EquipmentBrandResponseDto } from '../dtos/response';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

@Injectable()
export class EquipmentBrandsService {
  constructor(
    private readonly read: EquipmentBrandsReadService,
    private readonly crud: EquipmentBrandsCrudService,
  ) {}

  create(dto: CreateEquipmentBrandDto) {
    return this.crud.create(dto);
  }

  findAll(dto: EquipmentBrandFilterDto): Promise<PaginationResponseDto<EquipmentBrandResponseDto>> {
    return this.read.findAll(dto);
  }

  update(id: number, dto: UpdateEquipmentBrandDto) {
    return this.crud.update(id, dto);
  }

  getActive(dto: PaginationDto): Promise<PaginationResponseDto<EquipmentBrandResponseDto>> {
    return this.read.getActive(dto);
  }
}
