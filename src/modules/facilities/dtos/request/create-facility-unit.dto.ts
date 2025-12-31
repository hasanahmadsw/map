import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { FacilityUnitItemGroup } from '../../enums/facility-unit-item.enum';
import { Type } from 'class-transformer';

export class CreateFacilityUnitItemDto {
  @IsOptional()
  @IsEnum(FacilityUnitItemGroup)
  group?: FacilityUnitItemGroup;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  title: string;

  @IsNumber()
  @IsOptional()
  qty?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateFacilityUnitDto {
  @IsNumber()
  @Min(1)
  facilityId: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 140)
  slug: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  specs?: any;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsOptional()
  gallery?: any;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacilityUnitItemDto)
  items?: CreateFacilityUnitItemDto[];
}
