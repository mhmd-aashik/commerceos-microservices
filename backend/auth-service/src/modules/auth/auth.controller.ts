import {
  ConflictException,
  Controller,
  UnauthorizedException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'RegisterUser')
  async registerUser(data: RegisterUserDto) {
    try {
      const user = await this.authService.register(
        data.email,
        data.password,
        data.name,
      );

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'Email already registered',
        });
      }

      throw error;
    }
  }

  @GrpcMethod('AuthService', 'LoginUser')
  async loginUser(data: LoginUserDto) {
    return this.authService.login(data.email, data.password);
  }

  @GrpcMethod('AuthService', 'RefreshTokens')
  async refreshTokens(data: { refreshToken: string }) {
    try {
      return await this.authService.refreshTokens(data.refreshToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new RpcException({
          code: status.UNAUTHENTICATED,
          message: 'Invalid or expired refresh token',
        });
      }

      throw error;
    }
  }

  @GrpcMethod('AuthService', 'Logout')
  async logout(data: { refreshToken: string }) {
    try {
      return await this.authService.logout(data.refreshToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new RpcException({
          code: status.UNAUTHENTICATED,
          message: 'Invalid refresh token',
        });
      }

      throw error;
    }
  }
}
