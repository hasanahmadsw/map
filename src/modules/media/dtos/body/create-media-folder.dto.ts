import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMediaFolderDto {
  @IsString()
  @IsNotEmpty()
  folder: string; // full path inside the bucket
}
