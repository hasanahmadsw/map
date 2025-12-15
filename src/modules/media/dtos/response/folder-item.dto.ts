import { Expose } from 'class-transformer';

export class FolderItemDto {
  @Expose()
  name: string; // Only the folder name (without the full path)

  @Expose()
  path: string; // The full relative path from the bucket root (e.g. "banners/homepage")
}
