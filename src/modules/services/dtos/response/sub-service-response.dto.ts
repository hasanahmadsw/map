import { SubService } from '../../interfaces/sub-service.interface';

export class SubServiceResponseDto {
  icon?: string;
  title: string;
  description?: string;
  features?: string[];
  static fromEntity(entity: SubService): SubServiceResponseDto {
    const dto = new SubServiceResponseDto();
    dto.icon = entity.icon;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.features = entity.features;
    return dto;
  }
}
