import { Injectable } from '@nestjs/common';
import { IntentReadService } from './intent-read.service';
import { IntentCrudService } from './intent-crud.service';
import { CreateIntentDto } from '../dtos/request/create-intent.dto';
import { UpdateIntentDto } from '../dtos/request/update-intent.dto';
import { IntentResponseDto } from '../dtos/response/intent-response.dto';
import { IntentPublicResponseDto } from '../dtos/response/intent-public-response.dto';
import { IntentFilterDto } from '../dtos/query/intent-filter.dto';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { IntentEntity } from '../entities/intent.entity';

@Injectable()
export class IntentService {
  constructor(
    private readonly read: IntentReadService,
    private readonly crud: IntentCrudService,
  ) {}

  async create(dto: CreateIntentDto): Promise<IntentResponseDto> {
    const entity = await this.crud.create(dto);
    return IntentResponseDto.fromEntity(entity);
  }

  async findAll(dto: IntentFilterDto): Promise<PaginationResponseDto<IntentResponseDto>> {
    return this.read.findAll(dto);
  }

  async findOne(id: number): Promise<IntentResponseDto> {
    return this.read.findOne(id);
  }

  async update(id: number, dto: UpdateIntentDto): Promise<IntentResponseDto> {
    const entity = await this.crud.update(id, dto);
    return IntentResponseDto.fromEntity(entity);
  }

  async remove(id: number): Promise<void> {
    return this.crud.remove(id);
  }

  async getBySlugPublic(slug: string): Promise<IntentPublicResponseDto> {
    return this.read.getBySlugPublic(slug);
  }

  async getHubIntent(): Promise<IntentEntity | null> {
    return this.read.getHubIntent();
  }

  async getHubPublic(): Promise<IntentPublicResponseDto> {
    return this.read.getHubPublic();
  }

  async getTree(): Promise<IntentEntity[]> {
    return this.read.getTree();
  }

  getAllSlugsPublic() {
    return this.read.getAllSlugsPublic();
  }
}
