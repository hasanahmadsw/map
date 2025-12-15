import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { basename, extname } from 'path';
import { SupabaseStorageService } from '../../../../services/supabase/services/supabase-storage.service';
import { EnvironmentConfig } from '../../config/env.schema';

@Injectable()
export class UploadService {
  private readonly PICTURES_BUCKET_NAME: string;
  constructor(
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService<EnvironmentConfig>,
  ) {
    this.PICTURES_BUCKET_NAME = this.configService.getOrThrow('PICTURES_BUCKET_NAME');
  }

  async uploadPicture(
    picture: Express.Multer.File,
    metadata?: { vehicleId?: number; staffId?: number },
    folder?: string,
  ): Promise<string> {
    const ext = extname(picture.originalname).toLowerCase();
    const sanitized = this.sanitize(picture.originalname);
    const folderPrefix = this.normalizeFolder(folder);

    const filename = await this.generateUniqueFilename(sanitized, ext, folderPrefix);
    const path = folderPrefix ? `${folderPrefix}/${filename}` : filename;

    return this.supabaseStorageService.uploadFile(
      this.PICTURES_BUCKET_NAME,
      path,
      picture.buffer,
      picture.mimetype,
      metadata,
    );
  }

  async uploadPictures(
    pictures: Express.Multer.File[],
    metadata?: { vehicleId?: number; staffId?: number },
    folder?: string,
  ): Promise<string[]> {
    const uploadPromises = pictures.map((picture) => this.uploadPicture(picture, metadata, folder));
    return Promise.all(uploadPromises);
  }

  async uploadFile(
    file: Express.Multer.File,
    metadata?: { vehicleId?: number; staffId?: number },
    folder?: string,
  ): Promise<string> {
    const ext = extname(file.originalname).toLowerCase();
    const sanitized = this.sanitize(file.originalname);
    const folderPrefix = this.normalizeFolder(folder);
    const defaultFolder = 'documents';

    // Determine the base folder for file existence check
    const baseFolder = folderPrefix || defaultFolder;
    const filename = await this.generateUniqueFilename(sanitized, ext, baseFolder);
    const path = folderPrefix ? `${folderPrefix}/${filename}` : `${defaultFolder}/${filename}`;

    return this.supabaseStorageService.uploadFile(
      this.PICTURES_BUCKET_NAME,
      path,
      file.buffer,
      file.mimetype,
      metadata,
    );
  }

  deleteFiles(paths: string[]): Promise<void> {
    // Convert full URLs or absolute paths to relative paths starting from the bucket name
    const relativePaths = paths.map((p) => {
      // If it's a full URL, extract the path after the bucket name
      const bucketIndex = p.indexOf(this.PICTURES_BUCKET_NAME);
      if (bucketIndex !== -1) {
        const rel = p.substring(bucketIndex + this.PICTURES_BUCKET_NAME.length + 1);
        return rel.replace(/^\/+/, '');
      }
      // If it's already a relative path or absolute path, clean leading slashes
      return p.replace(/^\/+/, '');
    });

    return this.supabaseStorageService.deleteFiles(this.PICTURES_BUCKET_NAME, relativePaths);
  }

  private sanitize(name: string): string {
    return basename(name, extname(name))
      .normalize('NFKD') // Normalize Unicode (e.g., accents)
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase()
      .replace(/[^a-z0-9\-_.]/g, '-') // Allow only safe URL chars
      .replace(/-+/g, '-') // Collapse multiple dashes
      .replace(/^-|-$/g, '') // Trim dashes
      .substring(0, 100);
  }

  private normalizeFolder(folder?: string): string | null {
    if (!folder) return null;
    const f = folder.trim().replace(/^\/+|\/+$/g, '');
    // Prevent any attempts to go up like ../
    if (!f || f.includes('..')) return null;
    return f;
  }

  private async generateUniqueFilename(baseName: string, extension: string, folder?: string | null): Promise<string> {
    let filename = `${baseName}${extension}`;
    let counter = 1;
    const maxAttempts = 1000; // Prevent infinite loops

    // Check if the file exists and append number if needed
    while (counter <= maxAttempts) {
      const path = folder ? `${folder}/${filename}` : filename;
      const exists = await this.supabaseStorageService.fileExists(this.PICTURES_BUCKET_NAME, path);

      if (!exists) {
        return filename;
      }

      // File exists, try with a number appended
      const nameWithoutExt = baseName;
      filename = `${nameWithoutExt}-${counter}${extension}`;
      counter++;
    }

    // Fallback: if we've tried too many times, append timestamp
    const timestamp = Date.now();
    return `${baseName}-${timestamp}${extension}`;
  }
}
