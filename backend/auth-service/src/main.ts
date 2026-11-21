import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

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

  console.log(
    `${process.env.GRPC_HOST ?? '0.0.0.0'}:${process.env.GRPC_PORT ?? '50051'}`,
  );

  await app.listen();
}
await bootstrap();
