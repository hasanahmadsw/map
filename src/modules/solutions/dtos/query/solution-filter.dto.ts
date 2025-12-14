import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

export class SolutionFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
