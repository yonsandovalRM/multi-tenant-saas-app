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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Bookings & Availability')
@ApiBearerAuth()
@Controller('bookings')
@TenantAuth()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  // ==================== ENDPOINTS DE RESERVAS ====================

  @Post()
  @ApiOperation({
    summary: 'Create new booking',
    description: 'Create a new booking for a service',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiCreatedResponse({
    description: 'Booking created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        serviceId: { type: 'string' },
        professionalId: { type: 'string' },
        clientId: { type: 'string' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['confirmed', 'pending', 'cancelled'] },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid booking data or time slot not available',
  })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieve all bookings for the current tenant',
  })
  @ApiOkResponse({
    description: 'List of bookings',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          serviceId: { type: 'string' },
          professionalId: { type: 'string' },
          clientId: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          status: { type: 'string' },
        },
      },
    },
  })
  findAll(@GetAuthContext() authContext: AuthContext) {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get booking by ID',
    description: 'Retrieve a specific booking by its ID',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', type: 'string' })
  @ApiOkResponse({
    description: 'Booking details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        serviceId: { type: 'string' },
        professionalId: { type: 'string' },
        clientId: { type: 'string' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
        notes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  findOne(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update booking',
    description: 'Update an existing booking',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', type: 'string' })
  @ApiBody({ type: UpdateBookingDto })
  @ApiOkResponse({ description: 'Booking updated successfully' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel booking',
    description: 'Cancel a booking by ID',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', type: 'string' })
  @ApiOkResponse({ description: 'Booking cancelled successfully' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  remove(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.bookingsService.remove(+id);
  }

  // ==================== ENDPOINTS DE DISPONIBILIDAD ====================

  @Get('availability/professional/:professionalId')
  @ApiOperation({
    summary: 'Get professional availability',
    description: 'Get availability for a specific professional on a given date',
  })
  @ApiParam({
    name: 'professionalId',
    description: 'Professional ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    type: 'string',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'serviceId',
    description: 'Service ID (optional)',
    type: 'string',
    required: false,
  })
  @ApiOkResponse({
    description: 'Professional availability slots',
    schema: {
      type: 'object',
      properties: {
        professionalId: { type: 'string' },
        date: { type: 'string', format: 'date' },
        availableSlots: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              startTime: { type: 'string', format: 'time' },
              endTime: { type: 'string', format: 'time' },
              duration: { type: 'number', description: 'Duration in minutes' },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid date format' })
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

  @Get('availability/professionals')
  @ApiOperation({
    summary: 'Get multiple professionals availability',
    description:
      'Get availability for multiple professionals on a specific date',
  })
  @ApiQuery({
    name: 'professionalIds',
    description: 'Comma-separated list of professional IDs',
    type: 'string',
    example: 'id1,id2,id3',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    type: 'string',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'serviceId',
    description: 'Service ID (optional)',
    type: 'string',
    required: false,
  })
  @ApiOkResponse({
    description: 'Multiple professionals availability',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          professionalId: { type: 'string' },
          professionalName: { type: 'string' },
          availableSlots: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                startTime: { type: 'string', format: 'time' },
                endTime: { type: 'string', format: 'time' },
                duration: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
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

  @Get('availability/professional/:professionalId/range')
  @ApiOperation({
    summary: 'Get professional availability range',
    description: 'Get availability for a professional across a date range',
  })
  @ApiParam({
    name: 'professionalId',
    description: 'Professional ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date in YYYY-MM-DD format',
    type: 'string',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date in YYYY-MM-DD format',
    type: 'string',
    example: '2024-01-20',
  })
  @ApiQuery({
    name: 'serviceId',
    description: 'Service ID (optional)',
    type: 'string',
    required: false,
  })
  @ApiOkResponse({
    description: 'Professional availability across date range',
    schema: {
      type: 'object',
      properties: {
        professionalId: { type: 'string' },
        dateRange: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
        availabilityByDate: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                startTime: { type: 'string', format: 'time' },
                endTime: { type: 'string', format: 'time' },
                duration: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
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

  @Get('availability/professional/:professionalId/next-slots')
  @ApiOperation({
    summary: 'Get next available slots',
    description:
      'Get the next available time slots for a professional and service',
  })
  @ApiParam({
    name: 'professionalId',
    description: 'Professional ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'serviceId',
    description: 'Service ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of slots to return (1-50)',
    type: 'number',
    required: false,
    example: 10,
  })
  @ApiOkResponse({
    description: 'Next available time slots',
    schema: {
      type: 'object',
      properties: {
        professionalId: { type: 'string' },
        serviceId: { type: 'string' },
        nextSlots: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date' },
              startTime: { type: 'string', format: 'time' },
              endTime: { type: 'string', format: 'time' },
              duration: { type: 'number' },
            },
          },
        },
      },
    },
  })
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
}
