import { StaffEntity } from '../../entities/staff.entity';
import { StaffRole } from '../../enums/staff-role.enums';

export class StaffResponseDto {
  id: number;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  createdAt: Date;
  role: StaffRole;

  static fromEntity(entity: StaffEntity): StaffResponseDto {
    const dto = new StaffResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.image = entity.image;
    dto.bio = entity.bio;
    dto.role = entity.role;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
