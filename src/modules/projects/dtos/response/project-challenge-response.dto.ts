export class ProjectChallengeResponseDto {
  title: string;
  description: string;

  static fromEntity(entity: { title: string; description: string }): ProjectChallengeResponseDto {
    const dto = new ProjectChallengeResponseDto();
    dto.title = entity.title;
    dto.description = entity.description;
    return dto;
  }
}
