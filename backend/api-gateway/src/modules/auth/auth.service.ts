import {
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  ServiceUnavailableException,
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
}
