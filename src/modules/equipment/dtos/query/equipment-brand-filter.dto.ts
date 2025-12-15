import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

export class EquipmentBrandFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
