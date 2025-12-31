import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { FacilityType } from '../../enums/facility-type.enum';

export class CreateFacilityDto {
  @IsNumber()
  @Min(1)
  solutionId: number;

  @IsEnum(FacilityType)
  type: FacilityType;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
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
}
