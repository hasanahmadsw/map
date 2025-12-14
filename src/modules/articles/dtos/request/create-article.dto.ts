import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  slug: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

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

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  topics?: string[];
}
