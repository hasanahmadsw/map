import { StaffEntity } from '../../entities/staff.entity';
import { StaffRole } from '../../enums/staff-role.enums';

export class FullStaffResponseDto {
  id: number;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  role: StaffRole;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: StaffEntity): FullStaffResponseDto {
    const dto = new FullStaffResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.image = entity.image;
    dto.bio = entity.bio;
    dto.role = entity.role;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
