import { z } from 'zod';
import { EquipmentType } from '../types/equipment.enums';

export enum MountType {
  EF = 'EF',
  RF = 'RF',
  PL = 'PL',
  E = 'E',
  L = 'L',
  MFT = 'MFT',
}

export enum SensorType {
  FULL_FRAME = 'full_frame',
  SUPER35 = 'super35',
  APS_C = 'aps_c',
  MFT = 'mft',
}

const BaseSpecs = z
  .object({
    v: z.number().int().min(1).default(1),
    type: z.nativeEnum(EquipmentType),
  })
  .strict();

export const CameraSpecsSchema = BaseSpecs.extend({
  type: z.literal(EquipmentType.CAMERA),
  sensor: z.nativeEnum(SensorType),
  maxResolution: z.enum(['4K', '4.5K', '5K', '6K', '8K']).optional(),
  maxFps: z.number().int().positive().max(1000).optional(),
  mounts: z.array(z.nativeEnum(MountType)).min(1),
  weightKg: z.number().positive().max(50).optional(),
  media: z.enum(['CFast2', 'SD', 'CFexpress', 'SSD', 'XQD']).optional(),
}).strict();

export const LensSpecsSchema = BaseSpecs.extend({
  type: z.literal(EquipmentType.LENS),
  mount: z.nativeEnum(MountType),
  focalLengthMm: z
    .object({
      min: z.number().positive().max(5000),
      max: z.number().positive().max(5000),
    })
    .strict(),
  aperture: z
    .object({
      minT: z.number().positive().max(50),
      maxT: z.number().positive().max(50),
    })
    .strict()
    .optional(),
  isZoom: z.boolean().default(true),
  weightG: z.number().int().positive().max(20000).optional(),
}).strict();

export const LightSpecsSchema = BaseSpecs.extend({
  type: z.literal(EquipmentType.LIGHT),
  powerW: z.number().int().positive().max(50000),
  colorTempK: z
    .object({
      min: z.number().int().min(1000).max(20000),
      max: z.number().int().min(1000).max(20000),
    })
    .strict()
    .optional(),
  hasRgb: z.boolean().default(false),
  mount: z.enum(['Bowens', 'JuniorPin', 'BabyPin', 'StandMount']).optional(),
}).strict();

export const AudioSpecsSchema = BaseSpecs.extend({
  type: z.literal(EquipmentType.AUDIO),
  category: z.enum(['mic', 'recorder', 'wireless', 'mixer']),
  pattern: z.enum(['cardioid', 'supercardioid', 'omni', 'shotgun']).optional(),
  channels: z.number().int().positive().max(64).optional(),
  phantomPower: z.boolean().optional(),
}).strict();

export const AccessorySpecsSchema = BaseSpecs.extend({
  type: z.literal(EquipmentType.ACCESSORY),
  // Accessories are usually very simple specs
  notes: z.string().max(500).optional(),
}).strict();

export const EquipmentSpecsSchema = z.discriminatedUnion('type', [
  CameraSpecsSchema,
  LensSpecsSchema,
  LightSpecsSchema,
  AudioSpecsSchema,
  AccessorySpecsSchema,
]);

export type EquipmentSpecs = z.infer<typeof EquipmentSpecsSchema>;
