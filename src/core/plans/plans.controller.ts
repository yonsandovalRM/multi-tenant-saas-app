import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

import { ValidRoles } from '../auth/interfaces/valid-roles';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Plans')
@ApiBearerAuth()
@Controller('core/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Create new plan',
    description: 'Create a new subscription plan (Admin only)',
  })
  @ApiBody({ type: CreatePlanDto })
  @ApiCreatedResponse({
    description: 'Plan created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        features: { type: 'array', items: { type: 'string' } },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all plans',
    description: 'Retrieve all available subscription plans',
  })
  @ApiOkResponse({
    description: 'List of all plans',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          features: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
        },
      },
    },
  })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get plan by ID',
    description: 'Retrieve a specific plan by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Plan details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        features: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update plan',
    description: 'Update an existing plan',
  })
  @ApiParam({ name: 'id', description: 'Plan ID', type: 'string' })
  @ApiBody({ type: UpdatePlanDto })
  @ApiOkResponse({
    description: 'Plan updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        features: { type: 'array', items: { type: 'string' } },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(+id, updatePlanDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete plan',
    description: 'Delete a plan by ID',
  })
  @ApiParam({ name: 'id', description: 'Plan ID', type: 'string' })
  @ApiOkResponse({ description: 'Plan deleted successfully' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(+id);
  }
}
