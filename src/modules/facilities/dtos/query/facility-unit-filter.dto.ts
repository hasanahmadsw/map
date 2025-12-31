import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

export class FacilityUnitFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  facilityId?: number;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
