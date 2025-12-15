import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { Type } from 'class-transformer';
import { EquipmentType } from '../../types/equipment.enums';

export class PublicEquipmentFilterDto extends PaginationDto {
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
  isFeatured?: boolean;
}
