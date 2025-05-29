import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

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

  async login(user: any): Promise<{ accessToken: string; user: any }> {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      isCoreUser: user.isCoreUser,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isCoreUser: user.isCoreUser,
        tenantId: user.tenantId,
      },
    };
  }

  // Registro para usuarios core (admin)
  async registerCoreUser(
    email: string,
    password: string,
    name: string,
    role: string = 'user',
  ): Promise<Partial<User>> {
    const user = await this.userService.createCoreUser({
      email,
      password,
      name,
      role,
    });
    const { password: _, ...result } = user.toObject();
    return result;
  }

  // Registro para usuarios de tenant
  async registerTenantUser(
    email: string,
    password: string,
    name: string,
    tenantId: string,
    role: string = 'user',
  ): Promise<Partial<User>> {
    const user = await this.userService.createTenantUser({
      email,
      password,
      name,
      tenantId,
      role,
    });
    const { password: _, ...result } = user.toObject();
    return result;
  }
}
