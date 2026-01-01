import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { EquipmentStatus, EquipmentType } from '../../types/equipment.enums';
import { Type } from 'class-transformer';

export class EquipmentFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsString()
  equipmentType?: EquipmentType;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  status?: EquipmentStatus;
}
