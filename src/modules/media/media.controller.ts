import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/shared/modules/upload/services/upload.service';
import { SupabaseStorageService } from 'src/services/supabase/services/supabase-storage.service';
import { createMulterConfig } from 'src/common/utils/multer-config.factory';
import { Protected } from 'src/common/decorators/roles.decorator';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import {
  ListMediaQueryDto,
  UploadMediaResponseDto,
  ListMediaResponseDto,
  MediaFileResponseDto,
  DeleteMediaBodyDto,
  DeleteMediaResponseDto,
  ListMediaTreeResponseDto,
  ListMediaTreeQueryDto,
  CreateMediaFolderDto,
} from './dtos';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from 'src/shared/modules/config/env.schema';
import { PaginationMetadataDto } from 'src/common/pagination/dto/pagination-detadata.dto';
import { UploadMediaDto } from './dtos/body/upload-media.dto';
import { FolderItemDto } from './dtos/response/folder-item.dto';

@Controller('media')
export class MediaController {
  private readonly MEDIA_BUCKET_NAME: string;

  constructor(
    private readonly uploadService: UploadService,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService<EnvironmentConfig>,
  ) {
    this.MEDIA_BUCKET_NAME = this.configService.getOrThrow('PICTURES_BUCKET_NAME');
  }

  @Post('upload')
  @Protected()
  @UseInterceptors(FilesInterceptor('files', 15, createMulterConfig('media', 50, 15)))
  @SerializeResponse(UploadMediaResponseDto)
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadMediaDto,
  ): Promise<UploadMediaResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const folder = body.folder?.replace(/^\/+|\/+$/g, '') || undefined;

    const urls = await this.uploadService.uploadPictures(files, undefined, folder);

    const response = new UploadMediaResponseDto();
    response.urls = urls;

    return response;
  }

  /**
   * Grid of files (with pagination) inside a given folder or root.
   */
  @Get()
  @Protected()
  @SerializeResponse(ListMediaResponseDto)
  async listMedia(@Query() query: ListMediaQueryDto): Promise<ListMediaResponseDto> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, Math.min(query.limit, 100));

    const basePrefix = query.folder ?? query.prefix ?? '';
    const prefixStartsWith = basePrefix.replace(/^\/+/, '');

    let mimePatterns: string[] | null = null;

    if (query.mime && query.mime.length > 0) {
      mimePatterns = query.mime;
    } else if (query.type) {
      switch (query.type) {
        case 'image':
          mimePatterns = ['image/%'];
          break;
        case 'video':
          mimePatterns = ['video/%'];
          break;
        case 'audio':
          mimePatterns = ['audio/%'];
          break;
        case 'all':
          mimePatterns = null;
          break;
      }
    } else {
      mimePatterns = null;
    }

    const { total, items } = await this.supabaseStorageService.listObjectsPagedFlat({
      bucketName: this.MEDIA_BUCKET_NAME,
      page,
      limit,
      signed: query.signed,
      expiresIn: query.expiresIn ?? 3600,
      orderBy: query.orderBy ?? 'name',
      orderDir: query.orderDir ?? 'asc',
      prefixStartsWith: prefixStartsWith || undefined,
      mimePatterns: mimePatterns || undefined,
    });

    const mediaFiles: MediaFileResponseDto[] = items.map((file) => {
      const dto = new MediaFileResponseDto();
      dto.name = file.name;
      dto.path = file.path;
      dto.url = file.url;
      dto.mimeType = file.mimeType;
      dto.size = file.size;
      dto.createdAt = file.createdAt;
      dto.updatedAt = file.updatedAt;
      return dto;
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginationMetadata = new PaginationMetadataDto();
    paginationMetadata.currentPage = page;
    paginationMetadata.limit = limit;
    paginationMetadata.total = total;
    paginationMetadata.totalPages = totalPages;
    paginationMetadata.nextPage = hasNextPage ? page + 1 : null;
    paginationMetadata.prevPage = hasPrevPage ? page - 1 : null;
    paginationMetadata.hasNextPage = hasNextPage;
    paginationMetadata.hasPrevPage = hasPrevPage;

    const response = new ListMediaResponseDto();
    response.data = mediaFiles;
    response.pagination = paginationMetadata;
    return response;
  }

  /**
   * Tree view: Returns the folders + direct files inside a given folder.
   */
  @Get('tree')
  @Protected()
  @SerializeResponse(ListMediaTreeResponseDto)
  async listMediaTree(@Query() query: ListMediaTreeQueryDto): Promise<ListMediaTreeResponseDto> {
    const folder = query.folder?.replace(/^\/+|\/+$/g, '') || undefined;

    const { folders, files } = await this.supabaseStorageService.listFoldersAndFiles({
      bucketName: this.MEDIA_BUCKET_NAME,
      prefix: folder,
      signed: query.signed,
      expiresIn: query.expiresIn ?? 3600,
    });

    const mediaFiles: MediaFileResponseDto[] = files.map((file) => {
      const dto = new MediaFileResponseDto();
      dto.name = file.name;
      dto.path = file.path;
      dto.url = file.url;
      dto.mimeType = file.mimeType;
      dto.size = file.size;
      dto.createdAt = file.createdAt;
      dto.updatedAt = file.updatedAt;
      return dto;
    });

    const folderDtos: FolderItemDto[] = folders.map((f) => {
      const dto = new FolderItemDto();
      dto.name = f.name;
      dto.path = f.path;
      return dto;
    });

    const response = new ListMediaTreeResponseDto();
    response.folders = folderDtos;
    response.files = mediaFiles;
    return response;
  }

  @Delete()
  @Protected()
  @SerializeResponse(DeleteMediaResponseDto)
  async deleteMedia(@Body() body: DeleteMediaBodyDto): Promise<DeleteMediaResponseDto> {
    if (!body.paths || body.paths.length === 0) {
      throw new BadRequestException('No file paths provided');
    }

    // Remove leading slashes and ensure paths are clean
    const cleanPaths = body.paths.map((path) => path.replace(/^\/+/, ''));

    await this.supabaseStorageService.deleteFiles(this.MEDIA_BUCKET_NAME, cleanPaths);

    const response = new DeleteMediaResponseDto();
    response.deletedCount = cleanPaths.length;
    response.message = `Successfully deleted ${cleanPaths.length} file(s)`;

    return response;
  }

  @Post('folders')
  @Protected()
  async createFolder(@Body() body: CreateMediaFolderDto) {
    const clean = body.folder.replace(/^\/+|\/+$/g, '');
    if (!clean) {
      throw new BadRequestException('Invalid folder name');
    }

    await this.supabaseStorageService.createFolder(this.MEDIA_BUCKET_NAME, clean);

    return { folder: clean };
  }
}
