import { IsString, IsNotEmpty, Length, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateSolutionDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  slug: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsOptional()
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;
}
