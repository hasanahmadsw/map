import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

export class ArticleFilterDto extends PaginationDto {
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
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}
