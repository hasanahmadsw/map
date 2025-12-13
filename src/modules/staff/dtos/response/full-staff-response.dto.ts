import { StaffEntity } from '../../entities/staff.entity';
import { StaffRole } from '../../enums/staff-role.enums';
import { StaffTranslationResponseDto } from './staff-translation-response.dto';

export class FullStaffResponseDto {
  id: number;
  name: string;
  email: string;
  image?: string;
  translations: StaffTranslationResponseDto[];
  role: StaffRole;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: StaffEntity): FullStaffResponseDto {
    const dto = new FullStaffResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.image = entity.image;
    dto.translations = entity.translations?.map((translation) => StaffTranslationResponseDto.fromEntity(translation));
    dto.role = entity.role;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
