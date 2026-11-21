import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
      this.authGrpcService.validateUser({ userId }),
    );

    return response.valid;
  }
}
