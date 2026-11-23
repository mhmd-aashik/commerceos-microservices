import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InventoryRepository } from './repositories/inventory.repository.js';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async checkStock(productId: string, quantity: number) {
    this.validateQuantity(quantity);

    const stock = await this.inventoryRepository.findByProductId(productId);

    if (!stock) {
      throw new NotFoundException('Inventory not found');
    }

    return {
      productId,
      requestedQuantity: quantity,
      availableQuantity: stock.availableQuantity,
      reservedQuantity: stock.reservedQuantity,
      isAvailable: stock.availableQuantity >= quantity,
    };
  }

  async reserveStock(productId: string, orderId: string, quantity: number) {
    this.validateQuantity(quantity);

    if (!productId || !orderId) {
      throw new BadRequestException('Product ID and Order ID are required');
    }

    return this.inventoryRepository.reserveStock(productId, orderId, quantity);
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }
  }
}
