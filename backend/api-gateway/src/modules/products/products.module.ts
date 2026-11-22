import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

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
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
