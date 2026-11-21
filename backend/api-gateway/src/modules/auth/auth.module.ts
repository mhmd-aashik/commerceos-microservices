import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],

        useFactory: (config: ConfigService) => {
          const host = config.getOrThrow<string>('grpc.auth.host');
          const port = config.getOrThrow<number>('grpc.auth.port');

          return {
            transport: Transport.GRPC,
            options: {
              package: 'auth',
              protoPath: join(
                process.cwd(),
                '../../packages/contracts/proto/auth.proto',
              ),
              url: `${host}:${port}`,
            },
          };
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
