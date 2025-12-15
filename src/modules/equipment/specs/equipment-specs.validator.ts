import { BadRequestException } from '@nestjs/common';
import { EquipmentType } from '../types/equipment.enums';
import { EquipmentSpecs, EquipmentSpecsSchema } from './equipment-specs.schema';

export function validateEquipmentSpecsOrThrow(equipmentType: EquipmentType, specs: unknown): EquipmentSpecs | null {
  if (specs === undefined || specs === null) return null;

  const parsed = EquipmentSpecsSchema.safeParse(specs);
  if (!parsed.success) {
    throw new BadRequestException({
      message: 'Invalid specs payload',
      issues: parsed.error.issues,
    });
  }

  if (parsed.data.type !== equipmentType) {
    throw new BadRequestException(`specs.type (${parsed.data.type}) must match equipmentType (${equipmentType})`);
  }

  return parsed.data;
}
