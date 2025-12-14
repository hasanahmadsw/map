import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStaffDto } from '../dtos/request/create-staff.dto';
import { LoginStaffDto } from '../dtos/request/login-staff.dto';
import { UpdateStaffBySuperAdminDto, UpdateStaffDto } from '../dtos/request/update-staff.dto';
import { StaffResponseDto } from '../dtos/response/staff-response.dto';
import { StaffFilterDto } from '../dtos/query/staff-filter.dto';
import { StaffEntity } from '../entities/staff.entity';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { PaginationResponseDto } from 'src/common/pagination/dto/pagination-response.dto';
import { StaffRole } from '../enums/staff-role.enums';
import { AppJwtService } from 'src/shared/modules/jwt/jwt.service';
import * as bcrypt from 'bcryptjs';
import { AuthorFilterDto } from '../dtos/query/author-filter.dto';
import { FullStaffResponseDto } from '../dtos/response/full-staff-response.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    private readonly jwtService: AppJwtService,
    private readonly paginationService: PaginationService,
  ) {}

  async login(loginStaffDto: LoginStaffDto) {
    const { email, password } = loginStaffDto;

    // Find staff by email
    const staff = await this.staffRepository.findOne({ where: { email } });
    if (!staff) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.jwtService.createAccessToken({
      id: staff.id,
      email: staff.email,
      role: staff.role,
    });

    // Return login response
    return {
      accessToken,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    };
  }

  async create(createStaffDto: CreateStaffDto): Promise<FullStaffResponseDto> {
    await this.validateEmailUniqueness(createStaffDto.email);

    // Create the staff entity
    const staff = this.staffRepository.create(createStaffDto);
    const savedStaff = await this.staffRepository.save(staff);

    return FullStaffResponseDto.fromEntity(savedStaff);
  }

  async update(staff: StaffEntity, updateStaffDto: UpdateStaffDto): Promise<FullStaffResponseDto> {
    const updatedStaff = this.staffRepository.merge(staff, updateStaffDto);
    const savedStaff = await this.staffRepository.save(updatedStaff);
    return FullStaffResponseDto.fromEntity(savedStaff);
  }

  async getMe(staff: StaffEntity): Promise<FullStaffResponseDto> {
    const me = await this.findOneOrThrow(staff.id);
    return FullStaffResponseDto.fromEntity(me);
  }

  async delete(id: number): Promise<void> {
    const staff = await this.findOneOrThrow(id);

    this.validateNotSuperAdmin(staff, 'Cannot delete SuperAdmin');

    await this.staffRepository.remove(staff);
  }

  async findAll(filterStaffDto: StaffFilterDto): Promise<PaginationResponseDto<StaffResponseDto>> {
    // Build query excluding password field for performance and security
    // Using select() to only fetch needed fields reduces data transfer
    const queryBuilder = this.createBaseQueryBuilder();

    this.applyStaffFilters(queryBuilder, filterStaffDto);

    // Use pagination service for consistent pagination logic
    return this.paginationService.paginateSafeQB(queryBuilder, filterStaffDto, {
      primaryId: 'staff.id',
      createdAt: 'staff.createdAt',
      map: (e: StaffEntity) => StaffResponseDto.fromEntity(e),
    });
  }

  async findAuthors(filterAuthorDto: AuthorFilterDto) {
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .where('staff.role = :role', { role: StaffRole.AUTHOR });

    return this.paginationService.paginateSafeQB(queryBuilder, filterAuthorDto, {
      primaryId: 'staff.id',
      createdAt: 'staff.createdAt',
      map: (e: StaffEntity) => StaffResponseDto.fromEntity(e),
    });
  }

  async findOneAuthor(id: number): Promise<StaffResponseDto> {
    const author = await this.findOneOrThrow(id);
    return StaffResponseDto.fromEntity(author);
  }

  async findOne(id: number, role?: StaffRole): Promise<StaffResponseDto> {
    const staff = await this.findOneOrThrow(id, role);
    return StaffResponseDto.fromEntity(staff);
  }

  async findOneForAuth(id: number, role?: StaffRole): Promise<StaffEntity> {
    return this.findOneOrThrow(id, role);
  }

  private async findOneEntity(id: number, role?: StaffRole): Promise<StaffEntity> {
    return this.findOneOrThrow(id, role);
  }

  async updateBySuperAdmin(id: number, updateStaffDto: UpdateStaffBySuperAdminDto): Promise<FullStaffResponseDto> {
    const staff = await this.findOneOrThrow(id);

    this.validateNotSuperAdmin(staff, 'Cannot update SuperAdmin');

    const updatedStaff = this.staffRepository.merge(staff, updateStaffDto);
    const savedStaff = await this.staffRepository.save(updatedStaff);

    return FullStaffResponseDto.fromEntity(savedStaff);
  }

  async findOneByEmail(email: string): Promise<StaffEntity> {
    return this.findOneByEmailOrThrow(email);
  }

  // Private helper methods

  /**
   * Finds a staff by ID (and optionally by role) and throws NotFoundException if not found
   */
  private async findOneOrThrow(id: number, role?: StaffRole): Promise<StaffEntity> {
    const whereCondition = this.buildWhereCondition(id, role);

    const staff = await this.staffRepository.findOne({
      where: whereCondition,
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return staff;
  }

  /**
   * Finds a staff by email and throws NotFoundException if not found
   */
  private async findOneByEmailOrThrow(email: string): Promise<StaffEntity> {
    const staff = await this.staffRepository.findOne({
      where: { email },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return staff;
  }

  /**
   * Validates that an email is unique, throws ConflictException if it exists
   */
  private async validateEmailUniqueness(email: string): Promise<void> {
    const existingStaff = await this.staffRepository.findOne({
      where: { email },
    });

    if (existingStaff) {
      throw new ConflictException('Staff with this email already exists');
    }
  }

  /**
   * Validates that staff is not SuperAdmin, throws ForbiddenException if it is
   */
  private validateNotSuperAdmin(staff: StaffEntity, message: string): void {
    if (staff.role === StaffRole.SUPERADMIN) {
      throw new ForbiddenException(message);
    }
  }

  /**
   * Builds where condition with optional role filter
   */
  private buildWhereCondition(id: number, role?: StaffRole): { id: number; role?: StaffRole } {
    const whereCondition: { id: number; role?: StaffRole } = { id };
    if (role !== null && role !== undefined) {
      whereCondition.role = role;
    }
    return whereCondition;
  }

  /**
   * Creates a base QueryBuilder with selected fields (excluding password)
   */
  private createBaseQueryBuilder() {
    return this.staffRepository
      .createQueryBuilder('staff')
      .select([
        'staff.id',
        'staff.name',
        'staff.email',
        'staff.image',
        'staff.role',
        'staff.bio',
        'staff.createdAt',
        'staff.updatedAt',
        'staff.passwordChangedAt',
      ]);
  }

  /**
   * Applies staff filters (name, email)
   */
  private applyStaffFilters(queryBuilder: any, filter: StaffFilterDto): void {
    if (filter.name) {
      queryBuilder.andWhere('staff.name ILIKE :name', {
        name: `%${filter.name}%`,
      });
    }
    if (filter.email) {
      queryBuilder.andWhere('staff.email = :email', { email: filter.email });
    }
  }
}
