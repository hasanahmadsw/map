import { SettingTranslationEntity } from '../../entities/setting-translation.entity';
import { MetaConfig } from '../../types';

export class SettingTranslationResponseDto {
  id: number;
  languageCode: string;
  siteName: string;
  siteDescription: string;
  meta?: MetaConfig;
  siteLogo: string;
  siteDarkLogo: string;
  language?: any;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: SettingTranslationEntity): SettingTranslationResponseDto {
    const dto = new SettingTranslationResponseDto();
    dto.id = entity.id;
    dto.languageCode = entity.languageCode;
    dto.siteName = entity.siteName;
    dto.siteDescription = entity.siteDescription;
    dto.meta = entity.meta;
    dto.siteLogo = entity.siteLogo;
    dto.siteDarkLogo = entity.siteDarkLogo;
    dto.language = entity.language;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
