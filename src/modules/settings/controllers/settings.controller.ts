import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import { CreateSettingDto } from '../dtos/request/create-setting.dto';
import { UpdateSettingDto } from '../dtos/request/update-setting.dto';
import { SettingResponseDto } from '../dtos/response/setting-response.dto';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('admin/settings')
  @Protected(Role.SUPER_ADMIN)
  @SerializeResponse(SettingResponseDto)
  create(@Body() createSettingDto: CreateSettingDto): Promise<SettingResponseDto> {
    return this.settingsService.create(createSettingDto);
  }

  @Post('admin/settings/initialize')
  @Protected(Role.SUPER_ADMIN)
  @SerializeResponse(SettingResponseDto)
  initializeSettings(): Promise<SettingResponseDto> {
    return this.settingsService.initializeDefaultSettings();
  }

  @Patch('admin/settings')
  @Protected(Role.SUPER_ADMIN)
  @SerializeResponse(SettingResponseDto)
  update(@Body() updateSettingDto: UpdateSettingDto): Promise<SettingResponseDto> {
    return this.settingsService.update(updateSettingDto);
  }

  // PUBLIC ENDPOINTS
  @Get('settings')
  @SerializeResponse(SettingResponseDto)
  getSettings(): Promise<SettingResponseDto> {
    return this.settingsService.getSettings();
  }
}
