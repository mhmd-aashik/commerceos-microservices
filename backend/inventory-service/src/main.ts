import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const grpcUrl = process.env.GRPC_URL;

  if (!grpcUrl) {
    throw new Error('GRPC_URL is missing from environment');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'inventory',
        protoPath: join(
          process.cwd(),
          '../../packages/contracts/proto/inventory.proto',
        ),
        url: grpcUrl,
        loader: {
          keepCase: false,
        },
      },
    },
  );

  app.enableShutdownHooks();

  await app.listen();

  console.log(`Inventory gRPC server running at ${grpcUrl}`);
}

void bootstrap();
