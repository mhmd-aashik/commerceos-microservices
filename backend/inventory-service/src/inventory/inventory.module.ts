import { Module } from '@nestjs/common';

import { InventoryGrpcController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';
import { InventoryRepository } from './repositories/inventory.repository.js';

@Module({
  controllers: [InventoryGrpcController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService],
})
export class InventoryModule {}
