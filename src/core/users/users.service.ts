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

  async createUser({ email, password, name }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      isActive: true,
    });
    return user.save();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserById(id: string): Promise<Partial<User> | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      return null;
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  async findOrCreateByGooglePayload(payload: any) {
    const user = await this.findUserByEmail(payload.email);
    if (user) {
      return user;
    }
    const newUser = new this.userModel({
      email: payload.email,
      name: payload.name,
      password: '',
      isActive: true,
    });
    return newUser.save();
  }
}
