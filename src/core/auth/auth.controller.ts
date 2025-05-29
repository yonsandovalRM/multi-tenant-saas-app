import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantRegisterDto } from './dto/tenant-register.dto';

@Controller('core/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register/core')
  async registerCore(@Body() registerDto: RegisterDto) {
    const { email, password, name, role } = registerDto;
    return this.authService.registerCoreUser(email, password, name, role);
  }

  @Post('register/tenant')
  async registerTenant(@Body() registerDto: TenantRegisterDto) {
    const { email, password, name, tenantId, role } = registerDto;
    return this.authService.registerTenantUser(
      email,
      password,
      name,
      tenantId,
      role,
    );
  }

  @Post('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google authentication process
  }

  @Post('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any) {
    return this.authService.login(req.user);
  }
}
