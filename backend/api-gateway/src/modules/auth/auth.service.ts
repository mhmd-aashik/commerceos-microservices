import {
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  catchError,
  firstValueFrom,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { status as grpcStatus } from '@grpc/grpc-js';

import {
  AuthGrpcService,
  LoginUserRequest,
  LoginUserResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokensRequest,
  RefreshTokensResponse,
  RegisterUserRequest,
  RegisterUserResponse,
} from './interfaces/auth-grpc.interface.js';

function isGrpcError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'number'
  );
}

@Injectable()
export class AuthService implements OnModuleInit {
  private authGrpcService!: AuthGrpcService;

  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.authGrpcService =
      this.authClient.getService<AuthGrpcService>('AuthService');
  }

  async validateUser(userId: string): Promise<boolean> {
    const response = await firstValueFrom(
      this.authGrpcService.validateUser({ userId }).pipe(
        timeout(3000),

        catchError((error: unknown) => {
          if (error instanceof TimeoutError) {
            return throwError(
              () =>
                new GatewayTimeoutException('Auth Service request timed out'),
            );
          }

          if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === grpcStatus.UNAVAILABLE
          ) {
            return throwError(
              () =>
                new ServiceUnavailableException(
                  'Auth Service is currently unavailable',
                ),
            );
          }

          return throwError(() => error);
        }),
      ),
    );

    return response.valid;
  }

  async register(data: RegisterUserRequest): Promise<RegisterUserResponse> {
    try {
      return await firstValueFrom(
        this.authGrpcService.registerUser(data).pipe(timeout(3000)),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException('Auth Service request timed out');
      }

      if (isGrpcError(error)) {
        if (error.code === grpcStatus.ALREADY_EXISTS) {
          throw new ConflictException('Email already registered');
        }

        if (error.code === grpcStatus.UNAVAILABLE) {
          throw new ServiceUnavailableException('Auth Service is unavailable');
        }

        if (error.code === grpcStatus.INVALID_ARGUMENT) {
          throw new BadRequestException('Invalid registration data');
        }
      }

      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(data: LoginUserRequest): Promise<LoginUserResponse> {
    try {
      return await firstValueFrom(
        this.authGrpcService.loginUser(data).pipe(timeout(3000)),
      );
    } catch (error: unknown) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException('Auth Service request timed out');
      }

      if (isGrpcError(error)) {
        if (error.code === grpcStatus.UNAUTHENTICATED) {
          throw new UnauthorizedException('Invalid credentials');
        }

        if (error.code === grpcStatus.INVALID_ARGUMENT) {
          throw new BadRequestException('Invalid login data');
        }

        if (error.code === grpcStatus.UNAVAILABLE) {
          throw new ServiceUnavailableException('Auth Service is unavailable');
        }
      }

      throw new InternalServerErrorException('Login failed');
    }
  }

  async refreshTokens(
    data: RefreshTokensRequest,
  ): Promise<RefreshTokensResponse> {
    try {
      return await firstValueFrom(
        this.authGrpcService.refreshTokens(data).pipe(timeout(3000)),
      );
    } catch (error: unknown) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException('Auth Service request timed out');
      }

      if (isGrpcError(error)) {
        if (error.code === grpcStatus.UNAUTHENTICATED) {
          throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (error.code === grpcStatus.INVALID_ARGUMENT) {
          throw new BadRequestException('Invalid refresh request');
        }

        if (error.code === grpcStatus.UNAVAILABLE) {
          throw new ServiceUnavailableException('Auth Service is unavailable');
        }
      }

      throw new InternalServerErrorException('Token refresh failed');
    }
  }

  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    try {
      return await firstValueFrom(
        this.authGrpcService.logout(data).pipe(timeout(3000)),
      );
    } catch (error: unknown) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException('Auth Service request timed out');
      }

      if (isGrpcError(error)) {
        if (error.code === grpcStatus.UNAUTHENTICATED) {
          throw new UnauthorizedException('Invalid refresh token');
        }

        if (error.code === grpcStatus.UNAVAILABLE) {
          throw new ServiceUnavailableException('Auth Service is unavailable');
        }
      }

      throw new InternalServerErrorException('Logout failed');
    }
  }
}
