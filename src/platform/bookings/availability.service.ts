import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectTenantModel } from '../multitenant/decorators/tenant-model.decorator';

import {
  ProfessionalSchedule,
  ScheduleType,
} from '../professional-schedule/entities/professional-schedule.entity';
import { UnavailableBlock } from '../unavailable-blocks/entities/unavailable-block.entity';
import { Booking, BookingStatus } from './entities/booking.entity';
import { ProfessionalService } from '../services/entities/professional-service.entity';
import { Service } from '../services/entities/service.entity';

export interface AvailabilitySlot {
  startTime: string; // formato "HH:mm"
  endTime: string; // formato "HH:mm"
  startDate: Date;
  endDate: Date;
  isAvailable: boolean;
}

export interface ProfessionalAvailability {
  professionalId: string;
  date: string; // formato "YYYY-MM-DD"
  slots: AvailabilitySlot[];
}

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectTenantModel('ProfessionalSchedule')
    private readonly professionalScheduleModel: Model<ProfessionalSchedule>,
    @InjectTenantModel('UnavailableBlock')
    private readonly unavailableBlockModel: Model<UnavailableBlock>,
    @InjectTenantModel('Booking')
    private readonly bookingModel: Model<Booking>,
    @InjectTenantModel('ProfessionalService')
    private readonly professionalServiceModel: Model<ProfessionalService>,
    @InjectTenantModel('Service')
    private readonly serviceModel: Model<Service>,
  ) {}

  /**
   * Genera los bloques de disponibilidad para un profesional en una fecha específica
   */
  async getProfessionalAvailability(
    professionalId: string,
    date: Date,
    serviceId?: string,
  ): Promise<ProfessionalAvailability> {
    const dateStr = this.formatDate(date);
    const dayOfWeek = this.getDayOfWeek(date);

    // 1. Obtener el horario del profesional
    const schedule = await this.getProfessionalSchedule(professionalId);
    if (!schedule || !schedule.schedule[dayOfWeek]?.isWorking) {
      return {
        professionalId,
        date: dateStr,
        slots: [],
      };
    }

    // 2. Obtener duración del servicio
    const serviceDuration = await this.getServiceDuration(
      professionalId,
      serviceId,
    );

    // 3. Generar bloques base según el horario
    const baseSlots = this.generateBaseSlots(
      schedule.schedule[dayOfWeek],
      date,
      serviceDuration,
    );

    // 4. Filtrar bloques no disponibles
    const availableSlots = await this.filterUnavailableSlots(
      professionalId,
      date,
      baseSlots,
    );

    return {
      professionalId,
      date: dateStr,
      slots: availableSlots,
    };
  }

  /**
   * Obtiene disponibilidad para múltiples profesionales
   */
  async getMultipleProfessionalsAvailability(
    professionalIds: string[],
    date: Date,
    serviceId?: string,
  ): Promise<ProfessionalAvailability[]> {
    const availabilities = await Promise.all(
      professionalIds.map((id) =>
        this.getProfessionalAvailability(id, date, serviceId),
      ),
    );

    return availabilities.filter(
      (availability) => availability.slots.length > 0,
    );
  }

  /**
   * Obtiene disponibilidad para un rango de fechas
   */
  async getProfessionalAvailabilityRange(
    professionalId: string,
    startDate: Date,
    endDate: Date,
    serviceId?: string,
  ): Promise<ProfessionalAvailability[]> {
    const dates = this.getDateRange(startDate, endDate);

    const availabilities = await Promise.all(
      dates.map((date) =>
        this.getProfessionalAvailability(professionalId, date, serviceId),
      ),
    );

    return availabilities.filter(
      (availability) => availability.slots.length > 0,
    );
  }

  /**
   * Obtiene el horario de un profesional
   */
  private async getProfessionalSchedule(
    professionalId: string,
  ): Promise<ProfessionalSchedule | null> {
    return this.professionalScheduleModel
      .findOne({ professionalId, isActive: true })
      .exec();
  }

  /**
   * Obtiene la duración efectiva del servicio para un profesional
   */
  private async getServiceDuration(
    professionalId: string,
    serviceId?: string,
  ): Promise<number> {
    if (!serviceId) return 60; // duración por defecto: 1 hora

    const professionalService = await this.professionalServiceModel
      .findOne({ professionalId, serviceId, isActive: true })
      .populate('serviceId')
      .exec();

    if (professionalService) {
      const service = professionalService.serviceId as any;
      return professionalService.customDuration || service.duration;
    }

    const service = await this.serviceModel.findById(serviceId).exec();
    return service?.duration || 60;
  }

  /**
   * Genera bloques base según el tipo de horario
   */
  private generateBaseSlots(
    daySchedule: any,
    date: Date,
    serviceDuration: number,
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];

    if (daySchedule.type === ScheduleType.FULL_TIME) {
      // Horario completo (ejemplo: 8:00 - 18:00)
      // Aquí deberías obtener el horario de la empresa desde configuración
      const workingHours = this.getDefaultWorkingHours();
      return this.createSlotsFromTimeRange(
        workingHours.start,
        workingHours.end,
        date,
        serviceDuration,
      );
    } else if (
      daySchedule.type === ScheduleType.CUSTOM_BLOCKS &&
      daySchedule.blocks
    ) {
      // Bloques personalizados
      for (const block of daySchedule.blocks) {
        const blockSlots = this.createSlotsFromTimeRange(
          block.start,
          block.end,
          date,
          serviceDuration,
        );
        slots.push(...blockSlots);
      }
    }

    return slots;
  }

  /**
   * Crea slots de tiempo desde un rango horario
   */
  private createSlotsFromTimeRange(
    startTime: string,
    endTime: string,
    date: Date,
    serviceDuration: number,
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    for (
      let currentMinutes = startTotalMinutes;
      currentMinutes + serviceDuration <= endTotalMinutes;
      currentMinutes += serviceDuration
    ) {
      const slotStartTime = this.minutesToTimeString(currentMinutes);
      const slotEndTime = this.minutesToTimeString(
        currentMinutes + serviceDuration,
      );

      const slotStartDate = new Date(date);
      const slotEndDate = new Date(date);

      const [slotStartHour, slotStartMin] = slotStartTime
        .split(':')
        .map(Number);
      const [slotEndHour, slotEndMin] = slotEndTime.split(':').map(Number);

      slotStartDate.setHours(slotStartHour, slotStartMin, 0, 0);
      slotEndDate.setHours(slotEndHour, slotEndMin, 0, 0);

      slots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        startDate: slotStartDate,
        endDate: slotEndDate,
        isAvailable: true,
      });
    }

    return slots;
  }

  /**
   * Filtra los slots que no están disponibles por reservas o bloques de indisponibilidad
   */
  private async filterUnavailableSlots(
    professionalId: string,
    date: Date,
    slots: AvailabilitySlot[],
  ): Promise<AvailabilitySlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener reservas existentes
    const existingBookings = await this.bookingModel
      .find({
        professionalId,
        startDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      })
      .exec();

    // Obtener bloques de indisponibilidad
    const unavailableBlocks = await this.unavailableBlockModel
      .find({
        professionalId,
        $or: [
          {
            startDate: { $lte: startOfDay },
            endDate: { $gte: endOfDay },
          },
          {
            startDate: { $gte: startOfDay, $lte: endOfDay },
          },
          {
            endDate: { $gte: startOfDay, $lte: endOfDay },
          },
        ],
      })
      .exec();

    return slots.map((slot) => {
      let isAvailable = true;

      // Verificar conflictos con reservas existentes
      const hasBookingConflict = existingBookings.some((booking) =>
        this.hasTimeConflict(
          slot.startDate,
          slot.endDate,
          booking.startDate,
          booking.endDate,
        ),
      );

      // Verificar conflictos con bloques de indisponibilidad
      const hasUnavailableConflict = unavailableBlocks.some((block) =>
        this.hasTimeConflict(
          slot.startDate,
          slot.endDate,
          block.startDate,
          block.endDate,
        ),
      );

      if (hasBookingConflict || hasUnavailableConflict) {
        isAvailable = false;
      }

      return {
        ...slot,
        isAvailable,
      };
    });
  }

  /**
   * Verifica si hay conflicto entre dos rangos de tiempo
   */
  private hasTimeConflict(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Convierte minutos a formato de tiempo "HH:mm"
   */
  private minutesToTimeString(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Obtiene el horario de trabajo por defecto
   */
  private getDefaultWorkingHours(): { start: string; end: string } {
    // Estos valores deberían venir de configuración de la empresa
    return {
      start: '08:00',
      end: '18:00',
    };
  }

  /**
   * Obtiene el día de la semana en formato requerido
   */
  private getDayOfWeek(date: Date): string {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[date.getDay()];
  }

  /**
   * Formatea fecha a string YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Genera un array de fechas entre startDate y endDate
   */
  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Obtiene los próximos slots disponibles para un profesional
   */
  async getNextAvailableSlots(
    professionalId: string,
    serviceId: string,
    limit: number = 10,
  ): Promise<AvailabilitySlot[]> {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // Buscar en los próximos 30 días

    const availabilities = await this.getProfessionalAvailabilityRange(
      professionalId,
      today,
      maxDate,
      serviceId,
    );

    const allSlots = availabilities
      .flatMap((availability) => availability.slots)
      .filter((slot) => slot.isAvailable)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit);

    return allSlots;
  }
}
