import { LanguageEntity } from '../../entities/language.entity';

export class LanguageResponseDto {
  id: number;
  code: string;
  nativeName: string;
  name: string;
  isDefault: boolean;
  updatedAt: Date;
  createdAt: Date;

  static fromEntity(entity: LanguageEntity): LanguageResponseDto {
    const dto = new LanguageResponseDto();
    dto.id = entity.id;
    dto.code = entity.code;
    dto.nativeName = entity.nativeName;
    dto.name = entity.name;
    dto.isDefault = entity.isDefault;
    dto.updatedAt = entity.updatedAt;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}