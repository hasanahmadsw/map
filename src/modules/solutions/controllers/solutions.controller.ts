import { Controller, Get, Param } from '@nestjs/common';
import { SolutionsConfigService } from '../services/solutions-config.service';
import { SolutionConfigResponseDto } from '../dtos/response/solution-config-response.dto';
import { SolutionKey } from '../solution-key.enum';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';

@Controller()
export class SolutionsController {
  constructor(private readonly solutionsConfigService: SolutionsConfigService) {}

  @Get('solutions')
  @SerializeResponse(SolutionConfigResponseDto)
  getAll(): SolutionConfigResponseDto[] {
    return this.solutionsConfigService.getAll().map((config) => SolutionConfigResponseDto.fromConfig(config));
  }

  @Get('solutions/:key')
  @SerializeResponse(SolutionConfigResponseDto)
  getByKey(@Param('key') key: string): SolutionConfigResponseDto | null {
    const solutionKey = key.toUpperCase() as SolutionKey;
    const config = this.solutionsConfigService.getByKey(solutionKey);
    return config ? SolutionConfigResponseDto.fromConfig(config) : null;
  }
}
