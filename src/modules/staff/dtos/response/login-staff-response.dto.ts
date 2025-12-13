class StaffInfoDto {
  id: number;
  name: string;
  email: string;
  role: string;
}

export class LoginStaffResponseDto {
  accessToken: string;
  staff: StaffInfoDto;
}
