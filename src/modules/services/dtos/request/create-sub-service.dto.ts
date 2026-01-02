import { IsString, IsOptional } from 'class-validator';

export class CreateSubServiceDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
