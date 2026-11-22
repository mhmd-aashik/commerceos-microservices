import { Module } from '@nestjs/common';

import { ProductsRepository } from './repositories/products.repository.js';
import { ProductsService } from './products.service.js';

@Module({
  providers: [ProductsRepository, ProductsService],
  exports: [ProductsRepository],
})
export class ProductsModule {}
