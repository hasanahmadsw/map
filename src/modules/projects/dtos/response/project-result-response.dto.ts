export class ProjectResultResponseDto {
  title: string;
  description: string;

  static fromEntity(entity: { title: string; description: string }): ProjectResultResponseDto {
    const dto = new ProjectResultResponseDto();
    dto.title = entity.title;
    dto.description = entity.description;
    return dto;
  }
}
