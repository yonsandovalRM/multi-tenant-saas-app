import { Module } from '@nestjs/common';
import { CompanyScheduleService } from './company-schedule.service';
import { CompanyScheduleController } from './company-schedule.controller';

@Module({
  controllers: [CompanyScheduleController],
  providers: [CompanyScheduleService],
})
export class CompanyScheduleModule {}
