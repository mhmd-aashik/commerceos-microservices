import { Module } from '@nestjs/common';

import { InventoryRepository } from './repositories/inventory.repository.js';

@Module({
  providers: [InventoryRepository],
  exports: [InventoryRepository],
})
export class InventoryModule {}
