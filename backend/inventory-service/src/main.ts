import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

async function bootstrap() {
  const grpcUrl = process.env.GRPC_URL!;

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
await bootstrap();
