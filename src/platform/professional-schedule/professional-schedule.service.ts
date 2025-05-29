import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { merge } from 'lodash';
import { InjectTenantModel } from '../multitenant/decorators/tenant-model.decorator';
import { BaseTenantService } from '../multitenant/services/base-tenant.service';
import {
  ProfessionalSchedule,
  ScheduleType,
} from './entities/professional-schedule.entity';
import { CreateProfessionalScheduleDto } from './dto/create-professional-schedule.dto';
import { UpdateProfessionalScheduleDto } from './dto/update-professional-schedule.dto';

@Injectable()
export class ProfessionalScheduleService extends BaseTenantService<ProfessionalSchedule> {
  constructor(
    @InjectTenantModel('ProfessionalSchedule')
    private readonly professionalScheduleModel: Model<ProfessionalSchedule>,
  ) {
    super(professionalScheduleModel);
  }

  async createProfessionalSchedule(
    createDto: CreateProfessionalScheduleDto,
  ): Promise<ProfessionalSchedule> {
    // Verificar si ya existe un horario para este profesional
    const existingSchedule = await this.findOne({
      professionalId: createDto.professionalId,
      deleteAt: { $exists: false },
    });

    if (existingSchedule) {
      throw new ConflictException(
        'Professional schedule already exists for this professional',
      );
    }

    // Validar bloques de tiempo si es CUSTOM_BLOCKS
    if (createDto.schedule) {
      this.validateTimeBlocks(createDto.schedule);
    }

    return this.create(createDto);
  }

  async updateProfessionalSchedule(
    id: string,
    updateDto: UpdateProfessionalScheduleDto,
  ): Promise<ProfessionalSchedule | null> {
    const currentSchedule = await this.professionalScheduleModel.findById(id);
    if (!currentSchedule) {
      throw new NotFoundException('Professional schedule not found');
    }

    // Validar bloques de tiempo si se está actualizando el horario
    if (updateDto.schedule) {
      this.validateTimeBlocks(updateDto.schedule);
    }

    // Merge de datos
    const mergedData = merge({}, currentSchedule.toObject(), updateDto);

    const updatedSchedule =
      await this.professionalScheduleModel.findByIdAndUpdate(id, mergedData, {
        new: true,
        runValidators: true,
      });

    return updatedSchedule;
  }

  async findByProfessionalId(
    professionalId: string,
  ): Promise<ProfessionalSchedule | null> {
    return this.findOne({
      professionalId,
      deleteAt: { $exists: false },
      isActive: true,
    });
  }

  async getActiveProfessionalSchedules(): Promise<ProfessionalSchedule[]> {
    return this.findAll({
      deleteAt: { $exists: false },
      isActive: true,
    });
  }

  async getProfessionalWorkingDays(professionalId: string): Promise<string[]> {
    const schedule = await this.findByProfessionalId(professionalId);
    if (!schedule) {
      return [];
    }

    const workingDays: string[] = [];
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    days.forEach((day) => {
      if (schedule.schedule[day]?.isWorking) {
        workingDays.push(day);
      }
    });

    return workingDays;
  }

  async getProfessionalAvailableHours(
    professionalId: string,
    dayOfWeek: string,
  ): Promise<{ start: string; end: string }[]> {
    const schedule = await this.findByProfessionalId(professionalId);
    if (!schedule || !schedule.schedule[dayOfWeek]?.isWorking) {
      return [];
    }

    const daySchedule = schedule.schedule[dayOfWeek];

    if (daySchedule.type === ScheduleType.CUSTOM_BLOCKS) {
      return daySchedule.blocks || [];
    }

    // Para FULL_TIME, necesitarías obtener el horario de la empresa
    // Esto requeriría inyectar el CompaniesService o hacer una consulta
    // Por ahora retorno un horario por defecto
    return [{ start: '09:00', end: '18:00' }];
  }

  private validateTimeBlocks(schedule: any): void {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    days.forEach((day) => {
      const daySchedule = schedule[day];
      if (
        daySchedule?.type === ScheduleType.CUSTOM_BLOCKS &&
        daySchedule.blocks
      ) {
        daySchedule.blocks.forEach((block: any, index: number) => {
          // Validar formato de hora
          if (
            !this.isValidTimeFormat(block.start) ||
            !this.isValidTimeFormat(block.end)
          ) {
            throw new Error(`Invalid time format in ${day} block ${index + 1}`);
          }

          // Validar que start sea menor que end
          if (
            this.timeToMinutes(block.start) >= this.timeToMinutes(block.end)
          ) {
            throw new Error(
              `Start time must be before end time in ${day} block ${index + 1}`,
            );
          }
        });

        // Validar que no haya solapamientos
        this.validateNoOverlappingBlocks(daySchedule.blocks, day);
      }
    });
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private validateNoOverlappingBlocks(blocks: any[], day: string): void {
    const sortedBlocks = blocks.sort(
      (a, b) => this.timeToMinutes(a.start) - this.timeToMinutes(b.start),
    );

    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const currentEnd = this.timeToMinutes(sortedBlocks[i].end);
      const nextStart = this.timeToMinutes(sortedBlocks[i + 1].start);

      if (currentEnd > nextStart) {
        throw new Error(`Overlapping time blocks detected in ${day}`);
      }
    }
  }
}
