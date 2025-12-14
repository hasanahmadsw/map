import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './controllers/staff.controller';
import { StaffService } from './services/staff.service';
import { StaffEntity } from './entities/staff.entity';
import { AppJwtModule } from 'src/shared/modules/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([StaffEntity]), AppJwtModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
