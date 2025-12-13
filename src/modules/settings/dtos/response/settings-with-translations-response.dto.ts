import { SettingEntity } from '../../entities/setting.entity';
import { SettingResponseDto } from './setting-response.dto';
import { SettingTranslationResponseDto } from './setting-translation-response.dto';

export class SettingsWithTranslationsResponseDto extends SettingResponseDto {
  translations: SettingTranslationResponseDto[];

  static fromEntityWithTranslations(
    entity: SettingEntity,
    translations: SettingTranslationResponseDto[],
  ): SettingsWithTranslationsResponseDto {
    const dto = new SettingsWithTranslationsResponseDto();
    const baseDto = SettingResponseDto.fromEntity(entity);
    Object.assign(dto, baseDto);
    dto.translations = translations;
    return dto;
  }
}
