import { SettingEntity } from '../../entities/setting.entity';
import { AnalyticsConfig, ContactInfo, CustomScripts, MetaConfig, SocialLink } from '../../types';

export class SettingResponseDto {
  id: number;
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  siteDarkLogo: string;
  siteFavicon: string;
  meta?: MetaConfig;
  social?: SocialLink[];
  analytics?: AnalyticsConfig;
  contact?: ContactInfo;
  customScripts?: CustomScripts;
  defaultLanguage: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: SettingEntity): SettingResponseDto {
    const dto = new SettingResponseDto();
    dto.id = entity.id;
    dto.siteName = entity.siteName;
    dto.siteDescription = entity.siteDescription;
    dto.siteLogo = entity.siteLogo;
    dto.siteDarkLogo = entity.siteDarkLogo;
    dto.siteFavicon = entity.siteFavicon;
    dto.meta = entity.meta;
    dto.social = entity.social;
    dto.analytics = entity.analytics;
    dto.contact = entity.contact;
    dto.customScripts = entity.customScripts;
    dto.defaultLanguage = entity.defaultLanguage;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
