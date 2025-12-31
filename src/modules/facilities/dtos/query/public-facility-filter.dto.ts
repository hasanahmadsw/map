import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { FacilityType } from '../../enums/facility-type.enum';

export class PublicFacilityFilterDto extends PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  solutionId?: number;

  @IsOptional()
  @IsString()
  solutionSlug?: string;

  @IsOptional()
  @IsEnum(FacilityType)
  type?: FacilityType;
}
