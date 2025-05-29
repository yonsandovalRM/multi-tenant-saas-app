import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfessionalScheduleService } from './professional-schedule.service';
import { CreateProfessionalScheduleDto } from './dto/create-professional-schedule.dto';
import { UpdateProfessionalScheduleDto } from './dto/update-professional-schedule.dto';

@Controller('professional-schedule')
export class ProfessionalScheduleController {
  constructor(private readonly professionalScheduleService: ProfessionalScheduleService) {}

  @Post()
  create(@Body() createProfessionalScheduleDto: CreateProfessionalScheduleDto) {
    return this.professionalScheduleService.create(createProfessionalScheduleDto);
  }

  @Get()
  findAll() {
    return this.professionalScheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionalScheduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfessionalScheduleDto: UpdateProfessionalScheduleDto) {
    return this.professionalScheduleService.update(+id, updateProfessionalScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.professionalScheduleService.remove(+id);
  }
}
