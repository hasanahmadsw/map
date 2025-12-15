import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateEquipmentBrandDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
