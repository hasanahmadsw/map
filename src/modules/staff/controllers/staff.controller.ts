import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { CreateStaffDto } from '../dtos/request/create-staff.dto';
import { LoginStaffDto } from '../dtos/request/login-staff.dto';
import { UpdateStaffBySuperAdminDto, UpdateStaffDto } from '../dtos/request/update-staff.dto';
import { StaffResponseDto } from '../dtos/response/staff-response.dto';
import { LoginStaffResponseDto } from '../dtos/response/login-staff-response.dto';
import { StaffFilterDto } from '../dtos/query/staff-filter.dto';
import { AuthorFilterDto } from '../dtos/query/author-filter.dto';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { SerializeResponse } from 'src/common/decorators/serialize-response.decorator';
import { Protected } from 'src/common/decorators/roles.decorator';
import { CurrentStaff } from 'src/common/decorators/staff.decorator';
import { Role } from 'src/common/enums/role.enum';
import { StaffEntity } from '../entities/staff.entity';
import { FullStaffResponseDto } from '../dtos/response/full-staff-response.dto';

@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SerializeResponse(LoginStaffResponseDto)
  async login(@Body() loginStaffDto: LoginStaffDto): Promise<LoginStaffResponseDto> {
    return this.staffService.login(loginStaffDto);
  }

  @Post('admin/staff')
  @Protected(Role.SUPER_ADMIN)
  @SerializeResponse(FullStaffResponseDto)
  create(@Body() createStaffDto: CreateStaffDto): Promise<FullStaffResponseDto> {
    return this.staffService.create(createStaffDto);
  }

  @Patch('admin/staff/me')
  @Protected(Role.ADMIN, Role.SUPER_ADMIN)
  @SerializeResponse(FullStaffResponseDto)
  update(@CurrentStaff() staff: StaffEntity, @Body() updateStaffDto: UpdateStaffDto): Promise<FullStaffResponseDto> {
    return this.staffService.update(staff, updateStaffDto);
  }

  @Patch('admin/staff/:id')
  @Protected(Role.SUPER_ADMIN)
  @SerializeResponse(FullStaffResponseDto)
  updateStaffBySuperAdmin(
    @Param('id', PositiveIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffBySuperAdminDto,
  ): Promise<FullStaffResponseDto> {
    return this.staffService.updateBySuperAdmin(id, updateStaffDto);
  }

  @Delete('admin/staff/:id')
  @Protected(Role.SUPER_ADMIN)
  async delete(@Param('id', PositiveIntPipe) id: number): Promise<void> {
    await this.staffService.delete(id);
  }

  @Get('admin/staff/me')
  @Protected()
  @SerializeResponse(FullStaffResponseDto)
  async getMe(@CurrentStaff() staff: StaffEntity): Promise<FullStaffResponseDto> {
    return this.staffService.getMe(staff);
  }

  @Get('admin/staff/:id')
  @Protected(Role.SUPER_ADMIN)
  @SerializeResponse(StaffResponseDto)
  findOne(@Param('id', PositiveIntPipe) id: number): Promise<StaffResponseDto> {
    return this.staffService.findOne(id);
  }

  @Get('admin/staff')
  @Protected(Role.SUPER_ADMIN)
  findAll(@Query() filterStaffDto: StaffFilterDto): Promise<PaginationResponseDto<StaffResponseDto>> {
    return this.staffService.findAll(filterStaffDto);
  }

  // ===== AUTHOR ENDPOINTS =====
  @Get('authors')
  findAuthors(@Query() filterAuthorDto: AuthorFilterDto): Promise<PaginationResponseDto<StaffResponseDto>> {
    return this.staffService.findAuthors(filterAuthorDto);
  }

  @Get('authors/:id')
  @SerializeResponse(StaffResponseDto)
  findOneAuthor(@Param('id', PositiveIntPipe) id: number): Promise<StaffResponseDto> {
    return this.staffService.findOneAuthor(id);
  }
}
