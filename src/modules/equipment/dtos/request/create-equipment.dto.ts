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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentStatus, EquipmentType } from '../../types/equipment.enums';
import { GalleryItemDto } from './gallery-item.dto';

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
  @ValidateNested({ each: true })
  @Type(() => GalleryItemDto)
  gallery?: GalleryItemDto[];

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
