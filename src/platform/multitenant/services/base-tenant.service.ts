import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

@Injectable()
export abstract class BaseTenantService<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(createDto: any): Promise<T> {
    const entity = new this.model(createDto);
    return entity.save();
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findById(id: string): Promise<T> {
    const entity = await this.model.findById(id).exec();
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async update(id: string, updateDto: UpdateQuery<T>): Promise<T> {
    const entity = await this.model
      .findByIdAndUpdate(id, updateDto, {
        new: true,
      })
      .exec();

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async remove(id: string): Promise<T> {
    const entity = await this.model.findByIdAndDelete(id).exec();
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async softDelete(id: string): Promise<T> {
    return this.update(id, { deletedAt: new Date() } as UpdateQuery<T>);
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }
}
