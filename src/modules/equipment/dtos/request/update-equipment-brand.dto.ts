import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipmentBrandDto } from './create-equipment-brand.dto';

export class UpdateEquipmentBrandDto extends PartialType(CreateEquipmentBrandDto) {}
