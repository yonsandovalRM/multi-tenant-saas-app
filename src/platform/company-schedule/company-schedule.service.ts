import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectTenantModel } from '../multitenant/decorators/tenant-model.decorator';
import { BaseTenantService } from '../multitenant/services/base-tenant.service';
import { CompanySchedule } from './entities/company-schedule.entity';
import { CreateCompanyScheduleDto } from './dto/create-company-schedule.dto';
import { UpdateCompanyScheduleDto } from './dto/update-company-schedule.dto';
import { BusinessException } from 'src/common/exceptions/business.exception';

@Injectable()
export class CompanyScheduleService extends BaseTenantService<CompanySchedule> {
  constructor(
    @InjectTenantModel('CompanySchedule')
    private readonly companyScheduleModel: Model<CompanySchedule>,
    @InjectTenantModel('Company')
    private readonly companyModel: Model<any>,
  ) {
    super(companyScheduleModel);
  }

  async createSchedule(
    createDto: CreateCompanyScheduleDto,
  ): Promise<CompanySchedule> {
    // Verificar que la empresa existe
    const companyExists = await this.companyModel.findById(
      new Types.ObjectId(createDto.company),
    );

    if (!companyExists) {
      throw new NotFoundException('Company not found');
    }

    // Verificar horarios existentes
    const existingSchedule = await this.findOne({
      company: new Types.ObjectId(createDto.company),
      dayOfWeek: createDto.dayOfWeek,
      deletedAt: null,
    });

    if (existingSchedule) {
      throw new ConflictException(
        'Schedule already exists for this company on this day',
      );
    }

    // Validar tiempos
    this.validateScheduleTimes(
      createDto.start,
      createDto.end,
      createDto.breakStart,
      createDto.breakEnd,
    );

    return this.create({
      ...createDto,
      company: new Types.ObjectId(createDto.company),
    });
  }

  async findByCompany(companyId: string): Promise<CompanySchedule[]> {
    return this.findAll({
      company: new Types.ObjectId(companyId),
      deletedAt: null,
    });
  }

  private validateScheduleTimes(
    start: string,
    end: string,
    breakStart?: string,
    breakEnd?: string,
  ): void {
    const startTime = this.timeToMinutes(start);
    const endTime = this.timeToMinutes(end);

    if (startTime >= endTime) {
      throw new BusinessException('Start time must be earlier than end time');
    }

    if (breakStart && breakEnd) {
      const breakStartTime = this.timeToMinutes(breakStart);
      const breakEndTime = this.timeToMinutes(breakEnd);

      if (breakStartTime >= breakEndTime) {
        throw new ConflictException(
          'Break start time must be earlier than break end time',
        );
      }

      if (breakStartTime < startTime || breakEndTime > endTime) {
        throw new ConflictException('Break times must be within working hours');
      }
    } else if (breakStart || breakEnd) {
      throw new ConflictException(
        'Both break start and end times must be provided',
      );
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
