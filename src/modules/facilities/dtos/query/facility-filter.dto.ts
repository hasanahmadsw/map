import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { FacilityType } from '../../enums/facility-type.enum';

export class FacilityFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  solutionId?: number;

  @IsOptional()
  @IsEnum(FacilityType)
  type?: FacilityType;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
