import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import type { ProductGrpcService } from '../interfaces/product-grpc.interface.js';

@Injectable()
export class ProductGrpcClient implements OnModuleInit {
  private productService!: ProductGrpcService;

  constructor(
    @Inject('PRODUCT_GRPC')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productService =
      this.client.getService<ProductGrpcService>('ProductService');
  }

  async getProduct(productId: string) {
    return firstValueFrom(
      this.productService.getProduct({ id: productId }).pipe(timeout(5000)),
    );
  }
}
