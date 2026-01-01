import { IsArray, IsInt, IsOptional, IsString, Min, ValidateIf, ValidateNested } from 'class-validator';

export class BroadcastUnitSpecsDto {
  // "HD / 4K" , "HD / 4K Ready"
  @IsString()
  @IsOptional()
  format?: string;

  // "64x64" , "Nevion 32x32"
  @IsString()
  @IsOptional()
  routing?: string;

  // intercom can be string or array
  @ValidateIf((o) => typeof o.intercom === 'string')
  @IsString()
  @IsOptional()
  intercom?: string;

  @ValidateIf((o) => Array.isArray(o.intercom))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  intercomList?: string[]; // alternative clean

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  useCases?: string[];

  // "Midas M32"
  @IsString()
  @IsOptional()
  audioMixer?: string;

  // "Hanabi HVS-490" or "Sony MVS-3000A"
  @IsString()
  @IsOptional()
  visionMixer?: string;

  // visionMixers array
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  visionMixers?: string[];

  // 12, 6...
  @IsInt()
  @Min(0)
  @IsOptional()
  cameraChains?: number;

  // "Sony HSC100R"
  @IsString()
  @IsOptional()
  cameraSystem?: string;

  // "APC UPS 40kV"
  @IsString()
  @IsOptional()
  powerBackup?: string;

  // "AC Powered"
  @IsString()
  @IsOptional()
  power?: string;

  // "Portable Flight Case"
  @IsString()
  @IsOptional()
  mobility?: string;

  // "Rapid Setup"
  @IsString()
  @IsOptional()
  deployment?: string;
}
