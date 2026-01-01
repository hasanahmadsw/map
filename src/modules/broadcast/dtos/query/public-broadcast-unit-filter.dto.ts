import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { BroadcastType } from '../../enums/broadcast-type.enum';

export class PublicBroadcastUnitFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(BroadcastType)
  type?: BroadcastType;
}
