import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

export class PublicFacilityUnitFilterDto extends PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  facilityId?: number;
}
