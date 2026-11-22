import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { Request } from 'express';
import { Roles } from './decorators/roles.decorator.js';
import { RolesGuard } from './guards/roles.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('validate/:userId')
  async validateUser(@Param('userId') userId: string) {
    const valid = await this.authService.validateUser(userId);

    return {
      userId,
      valid,
    };
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() request: Request) {
    return {
      userId: request.user!.userId,
      message: 'Authenticated successfully',
    };
  }

  @Get('customer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER', 'ADMIN')
  getCustomerDashboard() {
    return {
      message: 'Customer dashboard',
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAdminDashboard() {
    return {
      message: 'Admin dashboard',
    };
  }
}
