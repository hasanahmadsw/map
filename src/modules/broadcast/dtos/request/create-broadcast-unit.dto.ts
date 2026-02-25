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
import { BroadcastUnitItemGroup } from '../../enums/broadcast-unit-item.enum';
import { BroadcastType } from '../../enums/broadcast-type.enum';
import { Type } from 'class-transformer';
import { BroadcastUnitSpecsDto } from './broadcast-unit-specs-dto';

export class CreateBroadcastUnitItemDto {
  @IsOptional()
  @IsEnum(BroadcastUnitItemGroup)
  group?: BroadcastUnitItemGroup;

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

export class CreateBroadcastUnitDto {
  @IsEnum(BroadcastType)
  @IsNotEmpty()
  type: BroadcastType;

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

  @IsOptional()
  @ValidateNested()
  @Type(() => BroadcastUnitSpecsDto)
  specs?: BroadcastUnitSpecsDto;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaKeywords?: string;

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
  @Type(() => CreateBroadcastUnitItemDto)
  items?: CreateBroadcastUnitItemDto[];
}
