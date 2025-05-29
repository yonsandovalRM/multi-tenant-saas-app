import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { AuthContext } from '../interfaces/auth-context.interface';

export const GetAuthContext = createParamDecorator(
  (data: string, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const cls: ClsService = request.cls;

    if (!user) {
      throw new InternalServerErrorException('User not found in context');
    }

    const authContext: AuthContext = {
      userId: user._id,
      email: user.email,
      role: user.role,
      tenantId: cls?.get('tenantId'),
      isCoreUser: user.isCoreUser || false,
    };

    return data ? authContext[data] : authContext;
  },
);
