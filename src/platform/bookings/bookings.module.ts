import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { AvailabilityService } from './availability.service';
import { ProfessionalScheduleModule } from '../professional-schedule/professional-schedule.module';
import { UnavailableBlocksModule } from '../unavailable-blocks/unavailable-blocks.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    ProfessionalScheduleModule,
    UnavailableBlocksModule,
    ServicesModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, AvailabilityService],
  exports: [BookingsService, AvailabilityService],
})
export class BookingsModule {}
