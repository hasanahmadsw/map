import { SubService } from '../../interfaces/sub-service.interface';

export class SubServiceResponseDto {
  title: string;
  description?: string;
  static fromEntity(entity: SubService): SubServiceResponseDto {
    const dto = new SubServiceResponseDto();
    dto.title = entity.title;
    dto.description = entity.description;
    return dto;
  }
}
