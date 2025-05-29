import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompanyScheduleService } from './company-schedule.service';
import { CreateCompanyScheduleDto } from './dto/create-company-schedule.dto';
import { UpdateCompanyScheduleDto } from './dto/update-company-schedule.dto';

@Controller('company-schedule')
export class CompanyScheduleController {
  constructor(
    private readonly companyScheduleService: CompanyScheduleService,
  ) {}

  @Post()
  create(@Body() createCompanyScheduleDto: CreateCompanyScheduleDto) {
    console.log(createCompanyScheduleDto);
    return this.companyScheduleService.create(createCompanyScheduleDto);
  }

  /* @Get('company/:companyId')
  findAll(@Param('companyId') companyId: string) {
    return this.companyScheduleService.findAllByCompany(companyId);
  } */

  /* @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyScheduleService.findOne(id);
  } */

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyScheduleDto: UpdateCompanyScheduleDto,
  ) {
    return this.companyScheduleService.update(id, updateCompanyScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyScheduleService.remove(id);
  }
}
