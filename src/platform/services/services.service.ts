import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectTenantModel } from '../multitenant/decorators/tenant-model.decorator';
import { BaseTenantService } from '../multitenant/services/base-tenant.service';
import { Service } from './entities/service.entity';
import { ProfessionalService } from './entities/professional-service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateProfessionalServiceDto } from './dto/create-professional-service.dto';
import { UpdateProfessionalServiceDto } from './dto/update-professional-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../../core/users/entities/user.entity';

@Injectable()
export class ServicesService extends BaseTenantService<Service> {
  constructor(
    @InjectTenantModel('Service')
    private readonly serviceModel: Model<Service>,
    @InjectTenantModel('ProfessionalService')
    private readonly professionalServiceModel: Model<ProfessionalService>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    super(serviceModel);
  }

  // ==================== SERVICIOS BÁSICOS ====================

  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    // Verificar si ya existe un servicio con el mismo nombre
    const existingService = await this.findOne({ name: createServiceDto.name });
    if (existingService) {
      throw new ConflictException('Service with this name already exists');
    }

    const serviceData = {
      ...createServiceDto,
      isActive: createServiceDto.isActive ?? true,
      bufferTime: createServiceDto.bufferTime ?? 0,
    };

    return this.create(serviceData);
  }

  async findAllServices(includeInactive = false): Promise<Service[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.findAll(filter);
  }

  async findServiceById(id: string): Promise<Service> {
    const service = await this.findById(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    // Verificar que el servicio existe
    await this.findServiceById(id);

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (updateServiceDto.name) {
      const existingService = await this.findOne({
        name: updateServiceDto.name,
        _id: { $ne: id },
      });
      if (existingService) {
        throw new ConflictException('Service with this name already exists');
      }
    }

    const updatedService = await this.update(id, updateServiceDto);
    if (!updatedService) {
      throw new NotFoundException('Service not found');
    }
    return updatedService;
  }

  async deleteService(id: string): Promise<void> {
    // Verificar que el servicio existe
    await this.findServiceById(id);

    // Verificar si hay servicios profesionales activos asociados
    const activeProfessionalServices =
      await this.professionalServiceModel.countDocuments({
        serviceId: id,
        isActive: true,
      });

    if (activeProfessionalServices > 0) {
      throw new ConflictException(
        'Cannot delete service. There are active professional services associated with it.',
      );
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    await this.update(id, { isActive: false });
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return this.findAll({ category, isActive: true });
  }

  async getActiveServicesByDuration(
    minDuration?: number,
    maxDuration?: number,
  ): Promise<Service[]> {
    const filter: any = { isActive: true };

    if (minDuration !== undefined || maxDuration !== undefined) {
      filter.duration = {};
      if (minDuration !== undefined) filter.duration.$gte = minDuration;
      if (maxDuration !== undefined) filter.duration.$lte = maxDuration;
    }

    return this.findAll(filter);
  }

  // ==================== SERVICIOS DE PROFESIONALES ====================

  async assignServiceToProfessional(
    createProfessionalServiceDto: CreateProfessionalServiceDto,
  ): Promise<ProfessionalService> {
    const { professionalId, serviceId } = createProfessionalServiceDto;
    const professional = await this.userModel.findById(professionalId);
    if (!professional?.role || professional.role !== UserRole.PROFESSIONAL) {
      throw new NotFoundException('The user is not a professional');
    }
    // Verificar que el servicio existe
    await this.findServiceById(serviceId);

    // Verificar si ya existe esta asignación
    const existingAssignment = await this.professionalServiceModel.findOne({
      professionalId,
      serviceId,
    });

    if (existingAssignment) {
      if (existingAssignment.isActive) {
        throw new ConflictException(
          'Professional is already assigned to this service',
        );
      }
      // Si existe pero está inactivo, reactivarlo
      existingAssignment.isActive = true;
      existingAssignment.customPrice = createProfessionalServiceDto.customPrice;
      existingAssignment.customDuration =
        createProfessionalServiceDto.customDuration;
      return existingAssignment.save();
    }

    // Crear nueva asignación
    const professionalService = new this.professionalServiceModel({
      ...createProfessionalServiceDto,
      isActive: createProfessionalServiceDto.isActive ?? true,
    });

    return professionalService.save();
  }

  async updateProfessionalService(
    id: string,
    updateProfessionalServiceDto: UpdateProfessionalServiceDto,
  ): Promise<ProfessionalService> {
    const professionalService =
      await this.professionalServiceModel.findByIdAndUpdate(
        id,
        updateProfessionalServiceDto,
        { new: true },
      );

    if (!professionalService) {
      throw new NotFoundException('Professional service assignment not found');
    }

    return professionalService;
  }

  async removeProfessionalService(id: string): Promise<void> {
    const professionalService =
      await this.professionalServiceModel.findById(id);
    if (!professionalService) {
      throw new NotFoundException('Professional service assignment not found');
    }

    // Soft delete: marcar como inactivo
    professionalService.isActive = false;
    await professionalService.save();
  }

  async getProfessionalServices(
    professionalId: string,
    includeInactive = false,
  ): Promise<any[]> {
    const filter: any = { professionalId };
    if (!includeInactive) {
      filter.isActive = true;
    }

    return this.professionalServiceModel
      .find(filter)
      .populate('serviceId')
      .populate('professionalId', 'name email')
      .exec();
  }

  async getServiceProfessionals(
    serviceId: string,
    includeInactive = false,
  ): Promise<any[]> {
    const filter: any = { serviceId };
    if (!includeInactive) {
      filter.isActive = true;
    }

    return this.professionalServiceModel
      .find(filter)
      .populate('professionalId', 'name email professionalSettings')
      .populate('serviceId')
      .exec();
  }

  async getProfessionalServiceDetails(
    professionalId: string,
    serviceId: string,
  ): Promise<any> {
    const professionalService = await this.professionalServiceModel
      .findOne({ professionalId, serviceId, isActive: true })
      .populate('serviceId')
      .populate('professionalId', 'name email professionalSettings')
      .exec();

    if (!professionalService) {
      throw new NotFoundException('Professional service assignment not found');
    }

    // Calcular precio y duración efectivos
    const service = professionalService.serviceId as any;
    const effectivePrice = professionalService.customPrice ?? service.price;
    const effectiveDuration =
      professionalService.customDuration ?? service.duration;

    return {
      ...professionalService.toObject(),
      effectivePrice,
      effectiveDuration,
    };
  }

  async getAvailableProfessionalsForService(serviceId: string): Promise<any[]> {
    // Verificar que el servicio existe
    await this.findServiceById(serviceId);

    return this.professionalServiceModel
      .find({ serviceId, isActive: true })
      .populate('professionalId', 'name email professionalSettings isActive')
      .exec()
      .then((results) =>
        results
          .filter((ps) => (ps.professionalId as any).isActive)
          .map((ps) => ({
            professionalId: ps.professionalId,
            customPrice: ps.customPrice,
            customDuration: ps.customDuration,
            assignmentId: ps._id,
          })),
      );
  }

  // ==================== MÉTODOS DE UTILIDAD ====================

  async getServiceStats(serviceId: string): Promise<any> {
    const service = await this.findServiceById(serviceId);

    const professionalCount =
      await this.professionalServiceModel.countDocuments({
        serviceId,
        isActive: true,
      });

    // Aquí podrías agregar más estadísticas como:
    // - Número de bookings
    // - Ingresos generados
    // - Rating promedio

    return {
      service,
      assignedProfessionals: professionalCount,
      // bookingCount: 0, // Implementar cuando tengas el módulo de bookings
      // totalRevenue: 0,
      // averageRating: 0,
    };
  }

  async bulkUpdateServicePrices(
    updates: Array<{ serviceId: string; newPrice: number }>,
  ): Promise<void> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.serviceId },
        update: { price: update.newPrice },
      },
    }));

    await this.serviceModel.bulkWrite(bulkOps);
  }

  async getServicesWithProfessionalCount(): Promise<any[]> {
    return this.serviceModel.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'professionalservices',
          localField: '_id',
          foreignField: 'serviceId',
          as: 'professionals',
          pipeline: [{ $match: { isActive: true } }],
        },
      },
      {
        $addFields: {
          professionalCount: { $size: '$professionals' },
        },
      },
      {
        $project: {
          professionals: 0,
        },
      },
    ]);
  }
}
