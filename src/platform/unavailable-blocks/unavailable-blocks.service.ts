import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { merge } from 'lodash';
import { InjectTenantModel } from '../multitenant/decorators/tenant-model.decorator';
import { BaseTenantService } from '../multitenant/services/base-tenant.service';
import {
  UnavailableBlock,
  UnavailableType,
} from './entities/unavailable-block.entity';
import { CreateUnavailableBlockDto } from './dto/create-unavailable-block.dto';
import { UpdateUnavailableBlockDto } from './dto/update-unavailable-block.dto';

@Injectable()
export class UnavailableBlocksService extends BaseTenantService<UnavailableBlock> {
  constructor(
    @InjectTenantModel('UnavailableBlock')
    private readonly unavailableBlockModel: Model<UnavailableBlock>,
  ) {
    super(unavailableBlockModel);
  }

  async createUnavailableBlock(
    createDto: CreateUnavailableBlockDto,
  ): Promise<UnavailableBlock> {
    // Validar fechas
    this.validateDateRange(createDto.startDate, createDto.endDate);

    // Validar patrón de recurrencia si existe
    if (createDto.isRecurring && createDto.recurrencePattern) {
      this.validateRecurrencePattern(createDto.recurrencePattern);
    }

    // Verificar solapamientos con bloques existentes
    await this.validateNoOverlappingBlocks(
      createDto.professionalId,
      new Date(createDto.startDate),
      new Date(createDto.endDate),
    );

    // Validar duración mínima y máxima
    this.validateBlockDuration(
      createDto.startDate,
      createDto.endDate,
      createDto.type,
    );

    // Validar horario de negocio
    this.validateBusinessHours(createDto.startDate, createDto.endDate);

    return this.create(createDto);
  }

  async updateUnavailableBlock(
    id: string,
    updateDto: UpdateUnavailableBlockDto,
  ): Promise<UnavailableBlock | null> {
    const currentBlock = await this.unavailableBlockModel.findById(id);
    if (!currentBlock) {
      throw new NotFoundException('Unavailable block not found');
    }

    // Validar fechas si se están actualizando
    if (updateDto.startDate || updateDto.endDate) {
      const startDate =
        updateDto.startDate || currentBlock.startDate.toISOString();
      const endDate = updateDto.endDate || currentBlock.endDate.toISOString();
      this.validateDateRange(startDate, endDate);

      // Validar solapamientos excluyendo el bloque actual
      await this.validateNoOverlappingBlocks(
        updateDto.professionalId || currentBlock.professionalId.toString(),
        new Date(startDate),
        new Date(endDate),
        id,
      );

      // Validar duración
      const type = updateDto.type || currentBlock.type;
      this.validateBlockDuration(startDate, endDate, type);

      // Validar horario de negocio
      this.validateBusinessHours(startDate, endDate);
    }

    // Validar patrón de recurrencia si se está actualizando
    if (updateDto.isRecurring && updateDto.recurrencePattern) {
      this.validateRecurrencePattern(updateDto.recurrencePattern);
    }

    // Merge de datos usando lodash
    const mergedData = merge({}, currentBlock.toObject(), updateDto);

    const updatedBlock = await this.unavailableBlockModel.findByIdAndUpdate(
      id,
      mergedData,
      { new: true, runValidators: true },
    );

    return updatedBlock;
  }

  async findByProfessionalId(
    professionalId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<UnavailableBlock[]> {
    const query: any = { professionalId };

    if (startDate || endDate) {
      query.$or = [];

      if (startDate && endDate) {
        // Bloques que se solapan con el rango dado
        query.$or = [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
        ];
      } else if (startDate) {
        query.endDate = { $gte: startDate };
      } else if (endDate) {
        query.startDate = { $lte: endDate };
      }
    }

    return this.findAll(query);
  }

  async findActiveBlocksForProfessional(
    professionalId: string,
    date: Date,
  ): Promise<UnavailableBlock[]> {
    return this.findAll({
      professionalId,
      startDate: { $lte: date },
      endDate: { $gte: date },
    });
  }

  async getRecurringBlocks(
    professionalId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UnavailableBlock[]> {
    const recurringBlocks = await this.findAll({
      professionalId,
      isRecurring: true,
      $or: [
        { 'recurrencePattern.endDate': { $exists: false } },
        { 'recurrencePattern.endDate': { $gte: startDate } },
      ],
    });

    // Expandir bloques recurrentes dentro del rango solicitado
    const expandedBlocks: UnavailableBlock[] = [];

    for (const block of recurringBlocks) {
      const occurrences = this.generateRecurringOccurrences(
        block,
        startDate,
        endDate,
      );
      expandedBlocks.push(...occurrences);
    }

    return expandedBlocks;
  }

  async isProfessionalAvailable(
    professionalId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const overlappingBlocks = await this.findAll({
      professionalId,
      startDate: { $lt: endTime },
      endDate: { $gt: startTime },
    });

    return overlappingBlocks.length === 0;
  }

  // Validaciones privadas
  private validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (start < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }
  }

  private validateRecurrencePattern(pattern: any): void {
    if (pattern.interval < 1) {
      throw new BadRequestException('Recurrence interval must be at least 1');
    }

    if (pattern.endDate) {
      const endDate = new Date(pattern.endDate);
      const now = new Date();

      if (endDate <= now) {
        throw new BadRequestException(
          'Recurrence end date must be in the future',
        );
      }
    }

    // Validar límites razonables
    const maxIntervals = {
      daily: 365, // máximo 1 año
      weekly: 52, // máximo 1 año
      monthly: 12, // máximo 1 año
    };

    if (pattern.interval > maxIntervals[pattern.frequency]) {
      throw new BadRequestException(
        `Maximum interval for ${pattern.frequency} recurrence is ${maxIntervals[pattern.frequency]}`,
      );
    }
  }

  private async validateNoOverlappingBlocks(
    professionalId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<void> {
    const query: any = {
      professionalId,
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const overlappingBlocks = await this.findAll(query);

    if (overlappingBlocks.length > 0) {
      throw new ConflictException(
        'This time slot overlaps with existing unavailable blocks',
      );
    }
  }

  private validateBlockDuration(
    startDate: string,
    endDate: string,
    type: UnavailableType,
  ): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Duraciones mínimas por tipo
    const minDurations = {
      [UnavailableType.BREAK]: 0.25, // 15 minutos
      [UnavailableType.PERSONAL]: 1, // 1 hora
      [UnavailableType.SICK_LEAVE]: 4, // 4 horas (medio día)
      [UnavailableType.VACATION]: 8, // 8 horas (día completo)
      [UnavailableType.CUSTOM]: 0.25, // 15 minutos
    };

    // Duraciones máximas por tipo
    const maxDurations = {
      [UnavailableType.BREAK]: 4, // 4 horas
      [UnavailableType.PERSONAL]: 24, // 1 día
      [UnavailableType.SICK_LEAVE]: 720, // 30 días
      [UnavailableType.VACATION]: 2160, // 90 días
      [UnavailableType.CUSTOM]: 168, // 1 semana
    };

    const minDuration = minDurations[type];
    const maxDuration = maxDurations[type];

    if (durationHours < minDuration) {
      throw new BadRequestException(
        `${type} blocks must be at least ${minDuration} hours long`,
      );
    }

    if (durationHours > maxDuration) {
      throw new BadRequestException(
        `${type} blocks cannot exceed ${maxDuration} hours`,
      );
    }
  }

  private validateBusinessHours(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Solo validar horarios de negocio para bloques del mismo día
    if (start.toDateString() === end.toDateString()) {
      const BUSINESS_START = 6; // 6:00 AM
      const BUSINESS_END = 22; // 10:00 PM

      const startHour = start.getHours();
      const endHour = end.getHours();

      if (startHour < BUSINESS_START || endHour > BUSINESS_END) {
        throw new BadRequestException(
          'Unavailable blocks must be within business hours (6:00 AM - 10:00 PM)',
        );
      }
    }
  }

  private generateRecurringOccurrences(
    block: UnavailableBlock,
    rangeStart: Date,
    rangeEnd: Date,
  ): UnavailableBlock[] {
    const occurrences: UnavailableBlock[] = [];
    const pattern = block.recurrencePattern;

    if (!pattern) return [];

    let currentDate = new Date(block.startDate);
    const blockDuration = block.endDate.getTime() - block.startDate.getTime();
    const patternEndDate = pattern.endDate || rangeEnd;

    while (currentDate <= rangeEnd && currentDate <= patternEndDate) {
      if (currentDate >= rangeStart) {
        // Crear una nueva ocurrencia
        const occurrence = {
          ...block.toObject(),
          startDate: new Date(currentDate),
          endDate: new Date(currentDate.getTime() + blockDuration),
        } as UnavailableBlock;

        occurrences.push(occurrence);
      }

      // Calcular siguiente ocurrencia
      switch (pattern.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + pattern.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + pattern.interval * 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + pattern.interval);
          break;
      }
    }

    return occurrences;
  }

  // Método para validar límites de bloques por profesional
  private async validateProfessionalLimits(
    professionalId: string,
    type: UnavailableType,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const monthStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1,
    );
    const monthEnd = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    );

    const existingBlocks = await this.findAll({
      professionalId,
      type,
      startDate: { $gte: monthStart },
      endDate: { $lte: monthEnd },
    });

    // Límites por tipo por mes
    const monthlyLimits = {
      [UnavailableType.VACATION]: 10, // 10 días de vacaciones por mes
      [UnavailableType.SICK_LEAVE]: 5, // 5 días de licencia médica por mes
      [UnavailableType.PERSONAL]: 15, // 15 bloques personales por mes
      [UnavailableType.BREAK]: 60, // 60 descansos por mes
      [UnavailableType.CUSTOM]: 20, // 20 bloques custom por mes
    };

    const limit = monthlyLimits[type];
    if (existingBlocks.length >= limit) {
      throw new BadRequestException(
        `Monthly limit of ${limit} ${type} blocks exceeded`,
      );
    }
  }
}
