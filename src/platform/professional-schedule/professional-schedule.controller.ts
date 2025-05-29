import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProfessionalScheduleService } from './professional-schedule.service';
import { CreateProfessionalScheduleDto } from './dto/create-professional-schedule.dto';
import { UpdateProfessionalScheduleDto } from './dto/update-professional-schedule.dto';
import { TenantAuth } from '../../core/auth/decorators/enhanced-auth.decorator';
import { GetAuthContext } from '../../core/auth/decorators/get-auth-context.decorator';
import { AuthContext } from '../../core/auth/interfaces/auth-context.interface';
import { ValidRoles } from '../../core/auth/interfaces/valid-roles';

@Controller('professional-schedule')
@TenantAuth()
export class ProfessionalScheduleController {
  constructor(
    private readonly professionalScheduleService: ProfessionalScheduleService,
  ) {}

  @Post()
  @TenantAuth(ValidRoles.admin, ValidRoles.user)
  create(
    @Body() createProfessionalScheduleDto: CreateProfessionalScheduleDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.professionalScheduleService.createProfessionalSchedule(
      createProfessionalScheduleDto,
    );
  }

  @Get()
  findAll(@GetAuthContext() authContext: AuthContext) {
    return this.professionalScheduleService.getActiveProfessionalSchedules();
  }

  @Get('professional/:professionalId')
  findByProfessional(
    @Param('professionalId') professionalId: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.professionalScheduleService.findByProfessionalId(
      professionalId,
    );
  }

  @Get('professional/:professionalId/working-days')
  getWorkingDays(
    @Param('professionalId') professionalId: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.professionalScheduleService.getProfessionalWorkingDays(
      professionalId,
    );
  }

  @Get('professional/:professionalId/available-hours')
  getAvailableHours(
    @Param('professionalId') professionalId: string,
    @Query('day') dayOfWeek: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.professionalScheduleService.getProfessionalAvailableHours(
      professionalId,
      dayOfWeek,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.professionalScheduleService.findById(id);
  }

  @Patch(':id')
  @TenantAuth(ValidRoles.admin)
  update(
    @Param('id') id: string,
    @Body() updateProfessionalScheduleDto: UpdateProfessionalScheduleDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.professionalScheduleService.updateProfessionalSchedule(
      id,
      updateProfessionalScheduleDto,
    );
  }

  @Delete(':id')
  @TenantAuth(ValidRoles.admin)
  remove(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.professionalScheduleService.remove(id);
  }
}
