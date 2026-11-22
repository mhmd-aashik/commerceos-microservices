import { Module } from '@nestjs/common';

import { ProductsRepository } from './repositories/products.repository.js';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsRepository, ProductsService],
  exports: [ProductsRepository],
})
export class ProductsModule {}
