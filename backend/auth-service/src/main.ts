import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { status as grpcStatus } from '@grpc/grpc-js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(
          process.cwd(),
          '../../packages/contracts/proto/auth.proto',
        ),
        url: `${process.env.GRPC_HOST ?? '0.0.0.0'}:${process.env.GRPC_PORT ?? '50051'}`,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new RpcException({
          code: grpcStatus.INVALID_ARGUMENT,
          message:
            errors
              .flatMap((error) => Object.values(error.constraints ?? {}))
              .join(', ') || 'Invalid request data',
        }),
    }),
  );

  console.log(
    `${process.env.GRPC_HOST ?? '0.0.0.0'}:${process.env.GRPC_PORT ?? '50051'}`,
  );

  await app.listen();
}
await bootstrap();
