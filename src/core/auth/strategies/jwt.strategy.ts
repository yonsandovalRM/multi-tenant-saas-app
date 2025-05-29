import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/core/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: any): Promise<any> {
    const { sub } = payload;
    const user = await this.userService.findUserById(sub);

    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active, contact admin');
    }

    // Agregar información del payload al usuario
    return {
      ...user.toObject(),
    };
  }
}
