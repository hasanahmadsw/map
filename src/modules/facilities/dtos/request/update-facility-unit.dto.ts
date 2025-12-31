import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilityUnitDto } from './create-facility-unit.dto';

export class UpdateFacilityUnitDto extends PartialType(CreateFacilityUnitDto) {}
