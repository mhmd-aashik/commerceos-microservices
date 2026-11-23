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

  async releaseStock(reservationId: string) {
    this.validateReservationId(reservationId);

    return this.inventoryRepository.releaseStock(reservationId);
  }

  async confirmStock(reservationId: string) {
    this.validateReservationId(reservationId);

    return this.inventoryRepository.confirmStock(reservationId);
  }

  private validateReservationId(reservationId: string): void {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(reservationId ?? '')) {
      throw new BadRequestException('A valid reservation ID is required');
    }
  }
}
