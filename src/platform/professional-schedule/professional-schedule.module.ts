import { Module } from '@nestjs/common';
import { ProfessionalScheduleService } from './professional-schedule.service';
import { ProfessionalScheduleController } from './professional-schedule.controller';

@Module({
  controllers: [ProfessionalScheduleController],
  providers: [ProfessionalScheduleService],
  exports: [ProfessionalScheduleService],
})
export class ProfessionalScheduleModule {}
