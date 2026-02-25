import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { IntentType } from '../../types/intent-type.enum';

export class CreateIntentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  slug: string;

  @IsEnum(IntentType)
  @IsNotEmpty()
  type: IntentType;

  @IsOptional()
  parentId?: number | null;

  @IsOptional()
  @IsString()
  h1?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  subHeading?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  linkLabel?: string;

  @IsOptional()
  @IsObject()
  equipmentFilters?: Record<string, unknown>;
}
