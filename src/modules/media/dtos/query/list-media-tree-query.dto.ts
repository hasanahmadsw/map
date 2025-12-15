import { IsBoolean, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListMediaTreeQueryDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  signed?: boolean = false;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(86400)
  expiresIn?: number = 3600;
}
