import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AvailabilityService } from './availability.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { TenantAuth } from '../../core/auth/decorators/enhanced-auth.decorator';
import { GetAuthContext } from '../../core/auth/decorators/get-auth-context.decorator';
import { AuthContext } from '../../core/auth/interfaces/auth-context.interface';
import { ValidRoles } from '../../core/auth/interfaces/valid-roles';

@Controller('bookings')
@TenantAuth()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  // ==================== ENDPOINTS DE RESERVAS ====================

  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  findAll(@GetAuthContext() authContext: AuthContext) {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.bookingsService.remove(+id);
  }

  // ==================== ENDPOINTS DE DISPONIBILIDAD ====================

  /**
   * Obtiene la disponibilidad de un profesional para una fecha específica
   * GET /bookings/availability/professional/:professionalId?date=2024-01-15&serviceId=123
   */
  @Get('availability/professional/:professionalId')
  async getProfessionalAvailability(
    @GetAuthContext() authContext: AuthContext,
    @Param('professionalId') professionalId: string,
    @Query('date') dateStr: string,
    @Query('serviceId') serviceId?: string,
  ) {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    return this.availabilityService.getProfessionalAvailability(
      professionalId,
      date,
      serviceId,
    );
  }

  /**
   * Obtiene la disponibilidad de múltiples profesionales para una fecha
   * GET /bookings/availability/professionals?professionalIds=id1,id2&date=2024-01-15&serviceId=123
   */
  @Get('availability/professionals')
  async getMultipleProfessionalsAvailability(
    @GetAuthContext() authContext: AuthContext,
    @Query(
      'professionalIds',
      new ParseArrayPipe({ items: String, separator: ',' }),
    )
    professionalIds: string[],
    @Query('date') dateStr: string,
    @Query('serviceId') serviceId?: string,
  ) {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    return this.availabilityService.getMultipleProfessionalsAvailability(
      professionalIds,
      date,
      serviceId,
    );
  }

  /**
   * Obtiene la disponibilidad de un profesional para un rango de fechas
   * GET /bookings/availability/professional/:professionalId/range?startDate=2024-01-15&endDate=2024-01-20&serviceId=123
   */
  @Get('availability/professional/:professionalId/range')
  async getProfessionalAvailabilityRange(
    @GetAuthContext() authContext: AuthContext,
    @Param('professionalId') professionalId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('serviceId') serviceId?: string,
  ) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    return this.availabilityService.getProfessionalAvailabilityRange(
      professionalId,
      startDate,
      endDate,
      serviceId,
    );
  }

  /**
   * Obtiene los próximos slots disponibles para un profesional
   * GET /bookings/availability/professional/:professionalId/next-slots?serviceId=123&limit=10
   */
  @Get('availability/professional/:professionalId/next-slots')
  async getNextAvailableSlots(
    @GetAuthContext() authContext: AuthContext,
    @Param('professionalId') professionalId: string,
    @Query('serviceId') serviceId: string,
    @Query('limit') limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr) : 10;

    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new Error('Limit must be a number between 1 and 50');
    }

    return this.availabilityService.getNextAvailableSlots(
      professionalId,
      serviceId,
      limit,
    );
  }

  /**
   * Obtiene todos los profesionales disponibles para un servicio en una fecha y hora específica
   * GET /bookings/availability/service/:serviceId/professionals?date=2024-01-15&time=14:00
   */
  @Get('availability/service/:serviceId/professionals')
  async getAvailableProfessionalsForServiceAtTime(
    @Param('serviceId') serviceId: string,
    @Query('date') dateStr: string,
    @Query('time') timeStr: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    // Esta funcionalidad requeriría obtener todos los profesionales del servicio
    // y verificar su disponibilidad para la fecha y hora específica
    // Implementación pendiente según necesidades específicas
    return {
      message: 'Endpoint pendiente de implementación',
      serviceId,
      date: dateStr,
      time: timeStr,
    };
  }
}
