import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { GoogleProfile } from './interfaces/google-profile.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result as User;
    }
    return null;
  }

  async validateGoogleProfile(profile: any): Promise<User | undefined | false> {
    const email = profile.emails[0].value;
    const user = await this.userService.findOrCreateByGooglePayload({
      email,
      ...profile,
    });
    if (!user) {
      return false;
    }
    const { password, ...result } = user.toObject();
    return result as User;
  }

  async login(user: any): Promise<{ accessToken: string }> {
    const payload = { sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<Partial<User>> {
    /*  const existingUser = await this.userService.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    } */
    const user = await this.userService.createUser({ email, password, name });
    const { password: _, ...result } = user.toObject();
    return result;
  }
}
