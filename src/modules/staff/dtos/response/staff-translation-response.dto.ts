import { LanguageEntity } from '../../../languages/entities/language.entity';
import { StaffTranslationEntity } from '../../entities/staff-translation.entity';

export class StaffTranslationResponseDto {
  id: number;
  staffId: number;
  languageCode: string;
  name: string;
  bio: string;
  language: LanguageEntity;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: StaffTranslationEntity): StaffTranslationResponseDto {
    const dto = new StaffTranslationResponseDto();
    dto.id = entity.id;
    dto.staffId = entity.staffId;
    dto.languageCode = entity.languageCode;
    dto.name = entity.name;
    dto.bio = entity.bio;
    dto.language = entity.language;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
