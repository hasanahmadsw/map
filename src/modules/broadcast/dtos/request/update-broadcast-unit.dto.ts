import { PartialType } from '@nestjs/mapped-types';
import { CreateBroadcastUnitDto } from './create-broadcast-unit.dto';

export class UpdateBroadcastUnitDto extends PartialType(CreateBroadcastUnitDto) {}
