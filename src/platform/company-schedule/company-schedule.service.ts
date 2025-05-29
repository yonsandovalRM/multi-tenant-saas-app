import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyScheduleDto } from './dto/create-company-schedule.dto';
import { UpdateCompanyScheduleDto } from './dto/update-company-schedule.dto';
import { PROVIDER } from '../constants/providers';
import { Model, Types } from 'mongoose';
import { CompanySchedule } from './entities/company-schedule.entity';
import { BusinessException } from 'src/common/exceptions/business.exception';

@Injectable()
export class CompanyScheduleService {
  constructor(
    @Inject(PROVIDER.COMPANY_SCHEDULE_MODEL)
    private readonly companyScheduleModel: Model<CompanySchedule>,
    @Inject(PROVIDER.COMPANY_MODEL)
    private readonly companyModel: Model<CompanySchedule>,
  ) {}

  async create(createCompanyScheduleDto: CreateCompanyScheduleDto) {
    const companyExists = await this.companyModel.findById(
      new Types.ObjectId(createCompanyScheduleDto.company),
    );

    if (!companyExists) {
      throw new NotFoundException('Company not found');
    }

    const existingSchedule = await this.companyScheduleModel.findOne({
      company: new Types.ObjectId(createCompanyScheduleDto.company),
      dayOfWeek: createCompanyScheduleDto.dayOfWeek,
      deletedAt: null, // Solo considerar registros no eliminados
    });
    if (existingSchedule) {
      throw new ConflictException(
        'Already exists a schedule for this company on this day',
      );
    }

    // Validar que los tiempos sean coherentes
    this.validateScheduleTimes(
      createCompanyScheduleDto.start,
      createCompanyScheduleDto.end,
      createCompanyScheduleDto.breakStart,
      createCompanyScheduleDto.breakEnd,
    );

    const newSchedule = new this.companyScheduleModel({
      ...createCompanyScheduleDto,
      company: new Types.ObjectId(createCompanyScheduleDto.company),
    });

    return newSchedule.save();
  }

  async findAllByCompany(companyId: string) {
    const schedules = await this.companyScheduleModel
      .find({
        company: new Types.ObjectId(companyId),
        deletedAt: null,
      })
      .exec();

    if (!schedules || schedules.length === 0) {
      throw new NotFoundException('Does not exist schedules for this company');
    }

    return schedules;
  }

  async findOne(id: string) {
    const schedule = await this.companyScheduleModel
      .findOne({
        _id: new Types.ObjectId(id),
        deletedAt: null,
      })
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async update(id: string, updateCompanyScheduleDto: UpdateCompanyScheduleDto) {
    // Verificar que el horario exista
    const existingSchedule = await this.findOne(id);

    // Si se está actualizando el día, verificar que no exista otro horario para ese día
    if (updateCompanyScheduleDto.dayOfWeek) {
      const conflictSchedule = await this.companyScheduleModel.findOne({
        company: existingSchedule.company,
        dayOfWeek: updateCompanyScheduleDto.dayOfWeek,
        _id: { $ne: existingSchedule._id },
        deletedAt: null,
      });

      if (conflictSchedule) {
        throw new ConflictException(
          'Already exists a schedule for this company on this day',
        );
      }
    }

    // Validar tiempos si se están actualizando
    if (
      updateCompanyScheduleDto.start ||
      updateCompanyScheduleDto.end ||
      updateCompanyScheduleDto.breakStart ||
      updateCompanyScheduleDto.breakEnd
    ) {
      this.validateScheduleTimes(
        updateCompanyScheduleDto.start || existingSchedule.start,
        updateCompanyScheduleDto.end || existingSchedule.end,
        updateCompanyScheduleDto.breakStart || existingSchedule.breakStart,
        updateCompanyScheduleDto.breakEnd || existingSchedule.breakEnd,
      );
    }

    const updatedSchedule = await this.companyScheduleModel.findByIdAndUpdate(
      id,
      { ...updateCompanyScheduleDto },
      { new: true },
    );

    return updatedSchedule;
  }

  async remove(id: string) {
    // Soft delete (marcar como eliminado en lugar de borrar)
    const deletedSchedule = await this.companyScheduleModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!deletedSchedule) {
      throw new NotFoundException('Schedule not found');
    }

    return deletedSchedule;
  }

  private validateScheduleTimes(
    start: string,
    end: string,
    breakStart?: string,
    breakEnd?: string,
  ) {
    // Convertir tiempos a minutos para validación
    const startTime = this.timeToMinutes(start);
    const endTime = this.timeToMinutes(end);

    if (startTime >= endTime) {
      throw new BusinessException(
        'The start time must be earlier than the end time',
      );
    }

    if (breakStart && breakEnd) {
      const breakStartTime = this.timeToMinutes(breakStart);
      const breakEndTime = this.timeToMinutes(breakEnd);

      if (breakStartTime >= breakEndTime) {
        throw new ConflictException(
          'The break start time must be earlier than the break end time',
        );
      }

      if (breakStartTime < startTime || breakEndTime > endTime) {
        throw new ConflictException(
          'The break times must be within the working hours',
        );
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
