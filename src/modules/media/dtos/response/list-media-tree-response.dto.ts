import { Expose, Type } from 'class-transformer';
import { FolderItemDto } from './folder-item.dto';
import { MediaFileResponseDto } from './media-file-response.dto';

export class ListMediaTreeResponseDto {
  @Expose()
  @Type(() => FolderItemDto)
  folders: FolderItemDto[];

  @Expose()
  @Type(() => MediaFileResponseDto)
  files: MediaFileResponseDto[];
}
