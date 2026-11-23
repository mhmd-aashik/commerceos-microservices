import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { InventoryGrpcClient } from './inventory-grpc.client.js';
import { InventoryController } from './inventory.controller.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'INVENTORY_GRPC',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'inventory',
            protoPath: join(
              process.cwd(),
              '../../packages/contracts/proto/inventory.proto',
            ),
            url: config.getOrThrow<string>('INVENTORY_GRPC_URL'),
            loader: {
              keepCase: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryGrpcClient],
})
export class InventoryModule {}
