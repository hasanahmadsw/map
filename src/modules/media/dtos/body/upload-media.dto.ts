import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadMediaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  folder?: string; // Example: "banners" or "banners/homepage"
}
