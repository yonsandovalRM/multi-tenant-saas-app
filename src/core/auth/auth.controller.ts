import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantRegisterDto } from './dto/tenant-register.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('core/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({
    description: 'Login credentials',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', minLength: 6, example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register/core')
  @ApiOperation({
    summary: 'Register core user',
    description: 'Register a new core system user',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or email already exists',
  })
  async registerCore(@Body() registerDto: RegisterDto) {
    const { email, password, name, role } = registerDto;
    return this.authService.registerCoreUser(email, password, name, role);
  }

  @Post('register/tenant')
  @ApiOperation({
    summary: 'Register tenant user',
    description: 'Register a new user for a specific tenant',
  })
  @ApiBody({ type: TenantRegisterDto })
  @ApiCreatedResponse({
    description: 'Tenant user registered successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        tenantId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or email already exists',
  })
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
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Initiate Google OAuth authentication process',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth page',
  })
  async googleAuth() {
    // Initiates the Google authentication process
  }

  @Post('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handle Google OAuth callback and complete authentication',
  })
  @ApiOkResponse({
    description: 'Google authentication successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            googleId: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Google authentication failed' })
  async googleAuthCallback(@Req() req: any) {
    return this.authService.login(req.user);
  }
}
