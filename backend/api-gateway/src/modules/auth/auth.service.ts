import {
  GatewayTimeoutException,
  Inject,
  Injectable,
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

import { AuthGrpcService } from './interfaces/auth-grpc.interface.js';

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
}
