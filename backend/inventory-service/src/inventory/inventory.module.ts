import { Module } from '@nestjs/common';

import { InventoryRepository } from './repositories/inventory.repository.js';
import { InventoryService } from './inventory.service.js';

@Module({
  providers: [InventoryRepository, InventoryService],
  exports: [InventoryRepository],
})
export class InventoryModule {}
