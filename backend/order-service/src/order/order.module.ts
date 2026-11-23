import { Module } from '@nestjs/common';

import { OrderRepository } from './repositories/order.repository.js';

@Module({
  providers: [OrderRepository],
  exports: [OrderRepository],
})
export class OrderModule {}
