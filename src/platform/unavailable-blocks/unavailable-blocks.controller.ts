import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UnavailableBlocksService } from './unavailable-blocks.service';
import { CreateUnavailableBlockDto } from './dto/create-unavailable-block.dto';
import { UpdateUnavailableBlockDto } from './dto/update-unavailable-block.dto';
import { TenantAuth } from '../../core/auth/decorators/enhanced-auth.decorator';
import { GetAuthContext } from '../../core/auth/decorators/get-auth-context.decorator';
import { AuthContext } from '../../core/auth/interfaces/auth-context.interface';
import { ValidRoles } from '../../core/auth/interfaces/valid-roles';

@Controller('unavailable-blocks')
@TenantAuth()
export class UnavailableBlocksController {
  constructor(
    private readonly unavailableBlocksService: UnavailableBlocksService,
  ) {}

  @Post()
  @TenantAuth(ValidRoles.admin, ValidRoles.user)
  create(
    @Body() createUnavailableBlockDto: CreateUnavailableBlockDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.unavailableBlocksService.createUnavailableBlock(
      createUnavailableBlockDto,
    );
  }

  @Get()
  findAll(@GetAuthContext() authContext: AuthContext) {
    return this.unavailableBlocksService.findAll({});
  }

  @Get('professional/:professionalId')
  findByProfessional(
    @GetAuthContext() authContext: AuthContext,
    @Param('professionalId') professionalId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.unavailableBlocksService.findByProfessionalId(
      professionalId,
      start,
      end,
    );
  }

  @Get('professional/:professionalId/active')
  findActiveBlocks(
    @Param('professionalId') professionalId: string,
    @Query('date') date: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.unavailableBlocksService.findActiveBlocksForProfessional(
      professionalId,
      new Date(date),
    );
  }

  @Get('professional/:professionalId/recurring')
  getRecurringBlocks(
    @Param('professionalId') professionalId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.unavailableBlocksService.getRecurringBlocks(
      professionalId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('professional/:professionalId/availability')
  checkAvailability(
    @Param('professionalId') professionalId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.unavailableBlocksService.isProfessionalAvailable(
      professionalId,
      new Date(startTime),
      new Date(endTime),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.unavailableBlocksService.findById(id);
  }

  @Patch(':id')
  @TenantAuth(ValidRoles.admin, ValidRoles.user)
  update(
    @Param('id') id: string,
    @Body() updateUnavailableBlockDto: UpdateUnavailableBlockDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.unavailableBlocksService.updateUnavailableBlock(
      id,
      updateUnavailableBlockDto,
    );
  }

  @Delete(':id')
  @TenantAuth(ValidRoles.admin)
  remove(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.unavailableBlocksService.remove(id);
  }
}
