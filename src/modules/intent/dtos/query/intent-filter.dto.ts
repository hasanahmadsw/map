import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { IntentType } from '../../types/intent-type.enum';

export class IntentFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(IntentType)
  type?: IntentType;
}
