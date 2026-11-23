import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'node:path';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: join(
          process.cwd(),
          '../../packages/contracts/proto/order.proto',
        ),
        url: process.env.GRPC_URL!,
        loader: {
          keepCase: false,
        },
      },
    },
  );

  app.enableShutdownHooks();

  await app.listen();

  console.log('Order Service gRPC started');
}

bootstrap();
