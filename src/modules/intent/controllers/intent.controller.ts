import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IntentService } from '../services/intent.service';
import { CreateIntentDto, UpdateIntentDto } from '../dtos/request';
import { IntentResponseDto, IntentPublicResponseDto } from '../dtos/response';
import { IntentFilterDto } from '../dtos/query/intent-filter.dto';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

@Controller()
export class IntentController {
  constructor(private readonly service: IntentService) {}

  @Get('intent/hub')
  @SerializeResponse(IntentPublicResponseDto)
  async getHubPublic(): Promise<IntentPublicResponseDto> {
    return this.service.getHubPublic();
  }

  @Get('intent/slugs')
  getAllSlugsPublic() {
    return this.service.getAllSlugsPublic();
  }

  @Get('intent/slug/:slug')
  @SerializeResponse(IntentPublicResponseDto)
  getBySlugPublic(@Param('slug') slug: string): Promise<IntentPublicResponseDto> {
    return this.service.getBySlugPublic(slug);
  }

  @Post('admin/intent')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(IntentResponseDto)
  create(@Body() dto: CreateIntentDto): Promise<IntentResponseDto> {
    return this.service.create(dto);
  }

  @Get('admin/intent')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  findAll(@Query() dto: IntentFilterDto): Promise<PaginationResponseDto<IntentResponseDto>> {
    return this.service.findAll(dto);
  }

  @Get('admin/intent/tree')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  getTree() {
    return this.service.getTree();
  }

  @Get('admin/intent/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(IntentResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number): Promise<IntentResponseDto> {
    return this.service.findOne(id);
  }

  @Patch('admin/intent/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @SerializeResponse(IntentResponseDto)
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() dto: UpdateIntentDto,
  ): Promise<IntentResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete('admin/intent/:id')
  @Protected(Role.SUPER_ADMIN, Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', PositiveIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
