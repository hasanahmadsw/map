import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class GalleryItemDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsInt()
  @Min(1)
  order: number;
}

