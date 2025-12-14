import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubServiceDto } from './create-sub-service.dto';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  slug: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsOptional()
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSubServiceDto)
  subServices?: CreateSubServiceDto[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  solutionIds?: number[];
}
