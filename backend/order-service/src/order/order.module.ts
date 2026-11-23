import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ClientsModule, Transport } from '@nestjs/microservices';

import { join } from 'node:path';

import { OrderRepository } from './repositories/order.repository.js';
import { OrderService } from './order.service.js';
import { OrderGrpcController } from './order-grpc.controller.js';
import { ProductGrpcClient } from './clients/product-grpc.client.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_GRPC',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'product',
            protoPath: join(
              process.cwd(),
              '../../packages/contracts/proto/product.proto',
            ),
            url: config.getOrThrow<string>('PRODUCT_GRPC_URL'),
            loader: {
              keepCase: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [OrderGrpcController],
  providers: [OrderRepository, OrderService, ProductGrpcClient],
  exports: [OrderService],
})
export class OrderModule {}
