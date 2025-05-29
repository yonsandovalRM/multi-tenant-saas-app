import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async createCoreUser({
    email,
    password,
    name,
    role = 'user',
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true,
      isCoreUser: true,
      tenantId: null,
    });
    return user.save();
  }

  async createTenantUser({
    email,
    password,
    name,
    tenantId,
    role = 'user',
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true,
      isCoreUser: false,
      tenantId,
    });
    return user.save();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findTenantUsers(tenantId: string): Promise<User[]> {
    return this.userModel
      .find({ tenantId, isCoreUser: false })
      .select('-password')
      .exec();
  }

  async findCoreUsers(): Promise<User[]> {
    return this.userModel.find({ isCoreUser: true }).select('-password').exec();
  }
}
