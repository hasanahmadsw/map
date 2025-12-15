import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from 'src/shared/modules/config/env.schema';
import { Semaphore } from 'src/common/utils/semaphore';

@Injectable()
export class SupabaseStorageService {
  private readonly client: SupabaseClient;
  private readonly semaphore: Semaphore;

  constructor(private readonly configService: ConfigService<EnvironmentConfig, true>) {
    try {
      this.client = createClient(
        this.configService.getOrThrow('SUPABASE_URL'),
        this.configService.getOrThrow('SUPABASE_KEY'),
      );
      // Initialize semaphore with 20 concurrent requests to avoid overwhelming Supabase API
      this.semaphore = new Semaphore(20);
    } catch (err) {
      throw new Error('An error occurred while starting supabase service. The app is stopping');
    }
  }

  async uploadFile(
    bucketName: string,
    path: string,
    file: Buffer,
    contentType: string,
    metadata?: any,
  ): Promise<string> {
    try {
      await this.semaphore.acquire();

      const { data, error } = await this.client.storage.from(bucketName).upload(path, file, {
        contentType,
        upsert: false,
        ...(metadata && { metadata }),
      });

      if (error) {
        throw new InternalServerErrorException(`Error uploading file: ${error?.message}`);
      }

      const { data: urlData } = this.client.storage.from(bucketName).getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      throw new InternalServerErrorException(`Error uploading file: ${error}`);
    } finally {
      this.semaphore.release();
    }
  }

  async deleteFiles(bucketName: string, paths: string[]): Promise<void> {
    await this.semaphore.acquire();
    console.log(paths);
    const { error } = await this.client.storage.from(bucketName).remove(paths);
    if (error) {
      throw new InternalServerErrorException(`Error deleting file: ${error}`);
    }

    this.semaphore.release();
  }

  async listObjectsPagedFlat(params: {
    bucketName: string;
    page: number;
    limit: number;
    signed?: boolean;
    expiresIn?: number;
    prefixStartsWith?: string;
    mimePatterns?: string[];
    orderBy?: 'name' | 'created_at' | 'updated_at';
    orderDir?: 'asc' | 'desc';
  }): Promise<{
    total: number;
    items: Array<{
      name: string;
      path: string;
      mimeType?: string;
      size?: number;
      url: string;
      createdAt?: string;
      updatedAt?: string;
    }>;
  }> {
    const {
      bucketName,
      page,
      limit,
      signed = false,
      expiresIn = 3600,
      prefixStartsWith,
      mimePatterns = null,
      orderBy = 'name',
      orderDir = 'asc',
    } = params;

    if (page < 1) throw new InternalServerErrorException('page must be >= 1');
    if (limit < 1) throw new InternalServerErrorException('limit must be >= 1');

    const offset = (page - 1) * limit;
    const prefix = (prefixStartsWith ?? '').replace(/^\/+/, '') || null;

    const { data, error } = await this.client.rpc('list_storage_objects_flat', {
      p_bucket: bucketName,
      p_prefix: prefix,
      p_offset: offset,
      p_limit: limit,
      p_mime_patterns: mimePatterns,
      p_order_by: orderBy,
      p_order_dir: orderDir,
    });

    if (error) {
      throw new InternalServerErrorException(`Error listing objects (flat): ${error.message}`);
    }

    const rows = (data ?? []) as Array<{
      total: number;
      name: string;
      metadata: { mimetype?: string; size?: number } | null;
      created_at: string;
      updated_at: string;
    }>;

    const total = rows[0]?.total ?? 0;

    const items: Array<{
      name: string;
      path: string;
      mimeType?: string;
      size?: number;
      url: string;
      createdAt?: string;
      updatedAt?: string;
    }> = [];

    for (const row of rows) {
      const path = row.name;
      const mimeType = row.metadata?.mimetype;
      const size = row.metadata?.size;

      await this.semaphore.acquire();
      try {
        let url = '';
        if (signed) {
          const { data: sdata, error: serror } = await this.client.storage
            .from(bucketName)
            .createSignedUrl(path, expiresIn);
          if (serror) {
            throw new InternalServerErrorException(`Error creating signed URL for ${path}: ${serror.message}`);
          }
          url = sdata.signedUrl;
        } else {
          const { data: udata } = this.client.storage.from(bucketName).getPublicUrl(path);
          url = udata.publicUrl;
        }

        items.push({
          name: path,
          path,
          mimeType,
          size,
          url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      } finally {
        this.semaphore.release();
      }
    }

    return { total, items };
  }

  /**
   * Returns the direct folders + direct files inside a given prefix (folder).
   */
  async listFoldersAndFiles(params: {
    bucketName: string;
    prefix?: string; // current folder path, e.g. "banners/homepage"
    signed?: boolean;
    expiresIn?: number;
    orderBy?: 'name' | 'created_at' | 'updated_at';
    orderDir?: 'asc' | 'desc';
  }): Promise<{
    folders: Array<{ name: string; path: string }>;
    files: Array<{
      name: string;
      path: string;
      mimeType?: string;
      size?: number;
      url: string;
      createdAt?: string;
      updatedAt?: string;
    }>;
  }> {
    const { bucketName, prefix, signed = false, expiresIn = 3600, orderBy = 'name', orderDir = 'asc' } = params;

    const cleanPrefix = (prefix ?? '').replace(/^\/+|\/+$/g, '');
    const rpcPrefix = cleanPrefix || null;

    const basePrefix = cleanPrefix ? cleanPrefix + '/' : '';
    const folderSet = new Set<string>();
    const files: Array<{
      name: string;
      path: string;
      mimeType?: string;
      size?: number;
      url: string;
      createdAt?: string;
      updatedAt?: string;
    }> = [];

    const pageSize = 1000;
    let offset = 0;

    while (true) {
      const { data, error } = await this.client.rpc('list_storage_objects_flat', {
        p_bucket: bucketName,
        p_prefix: rpcPrefix,
        p_offset: offset,
        p_limit: pageSize,
        p_mime_patterns: null,
        p_order_by: orderBy,
        p_order_dir: orderDir,
      });

      if (error) {
        throw new InternalServerErrorException(`Error listing objects (flat tree): ${error.message}`);
      }

      const rows = (data ?? []) as Array<{
        total: number;
        name: string; // full path: "banners/homepage/hero-1.jpg"
        metadata: { mimetype?: string; size?: number } | null;
        created_at: string;
        updated_at: string;
      }>;

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        const fullPath = row.name;
        const relative = fullPath.startsWith(basePrefix) ? fullPath.substring(basePrefix.length) : fullPath;

        const slashIndex = relative.indexOf('/');

        if (slashIndex === -1) {
          // direct file in the current folder
          const mimeType = row.metadata?.mimetype;
          const size = row.metadata?.size;

          await this.semaphore.acquire();
          try {
            let url = '';
            if (signed) {
              const { data: sdata, error: serror } = await this.client.storage
                .from(bucketName)
                .createSignedUrl(fullPath, expiresIn);
              if (serror) {
                throw new InternalServerErrorException(`Error creating signed URL for ${fullPath}: ${serror.message}`);
              }
              url = sdata.signedUrl;
            } else {
              const { data: udata } = this.client.storage.from(bucketName).getPublicUrl(fullPath);
              url = udata.publicUrl;
            }

            files.push({
              name: relative,
              path: fullPath,
              mimeType,
              size,
              url,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            });
          } finally {
            this.semaphore.release();
          }
        } else {
          // element inside a deeper folder → take only the first part as a folder
          const folderName = relative.substring(0, slashIndex);
          if (folderName) {
            folderSet.add(folderName);
          }
        }
      }

      // if the number of rows is less than pageSize, it means the last page
      if (rows.length < pageSize) {
        break;
      }

      offset += pageSize;
    }

    const folders = Array.from(folderSet).map((name) => ({
      name,
      path: cleanPrefix ? `${cleanPrefix}/${name}` : name,
    }));

    return { folders, files };
  }

  async createFolder(bucketName: string, folderPath: string): Promise<void> {
    const normalized = folderPath.replace(/^\/+|\/+$/g, '');
    if (!normalized) {
      throw new InternalServerErrorException('Invalid folder path');
    }
    const exists = await this.folderExists(bucketName, normalized);
    if (exists) {
      // if you want to skip and consider it ok, or throw a custom Error
      return;
    }
    const key = `${normalized}/.keep`;
    await this.uploadFile(bucketName, key, Buffer.from('', 'utf-8'), 'text/plain');
  }

  async fileExists(bucketName: string, path: string): Promise<boolean> {
    await this.semaphore.acquire();
    try {
      // normalize the path (remove leading slashes if present)
      const cleanPath = path.replace(/^\/+/, '');

      const { data, error } = await this.client.rpc('file_exists', {
        p_bucket: bucketName,
        p_path: cleanPath,
      });

      if (error) {
        // you can log an error here if you want
        // this.logger.error(`Error in fileExists RPC: ${error.message}`);
        return false;
      }

      // Supabase returns data as a boolean directly
      return data === true;
    } finally {
      this.semaphore.release();
    }
  }

  async folderExists(bucketName: string, folderPath: string): Promise<boolean> {
    await this.semaphore.acquire();
    try {
      // remove leading and trailing slashes
      const cleanPrefix = folderPath.replace(/^\/+|\/+$/g, '');

      const { data, error } = await this.client.rpc('folder_exists', {
        p_bucket: bucketName,
        p_prefix: cleanPrefix,
      });

      if (error) {
        // same idea: you can log an error here if you want
        // this.logger.error(`Error in folderExists RPC: ${error.message}`);
        return false;
      }

      return data === true;
    } finally {
      this.semaphore.release();
    }
  }
}
