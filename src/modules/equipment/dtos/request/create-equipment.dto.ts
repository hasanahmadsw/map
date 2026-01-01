import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { EquipmentStatus, EquipmentType } from '../../types/equipment.enums';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  categoryId: number;

  @IsInt()
  brandId: number;

  @IsString()
  equipmentType: EquipmentType;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // Media paths
  @IsOptional()
  @IsString()
  coverPath?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryPaths?: string[];

  @IsOptional()
  @IsString()
  manualPath?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  // Specs jsonb
  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;

  @IsOptional()
  @IsString()
  status?: EquipmentStatus;
}
