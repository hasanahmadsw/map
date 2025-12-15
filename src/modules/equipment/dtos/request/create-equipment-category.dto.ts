import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { EquipmentType } from '../../types/equipment.enums';

export class CreateEquipmentCategoryDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(EquipmentType)
  @IsNotEmpty()
  type: EquipmentType;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
