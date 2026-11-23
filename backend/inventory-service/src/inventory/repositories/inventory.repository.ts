import { Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';

import { DatabaseService } from '../../database/database.service.js';
import { inventoryReservations } from '../../database/schema/inventory-reservations.schema.js';
import { inventory } from '../../database/schema/inventory.schema.js';

@Injectable()
export class InventoryRepository {
  constructor(private readonly database: DatabaseService) {}

  // Find stock by product ID
  async findByProductId(productId: string) {
    const [stock] = await this.database.db
      .select()
      .from(inventory)
      .where(eq(inventory.productId, productId))
      .limit(1);

    return stock ?? null;
  }

  // Create initial inventory
  async createStock(productId: string, quantity: number) {
    const [stock] = await this.database.db
      .insert(inventory)
      .values({
        productId,
        availableQuantity: quantity,
        reservedQuantity: 0,
      })
      .returning();

    return stock;
  }

  // Find an existing reservation
  async findReservation(orderId: string, inventoryId: string) {
    const [reservation] = await this.database.db
      .select()
      .from(inventoryReservations)
      .where(
        and(
          eq(inventoryReservations.orderId, orderId),
          eq(inventoryReservations.inventoryId, inventoryId),
        ),
      )
      .limit(1);

    return reservation ?? null;
  }

  // Atomically decrease available stock
  async decreaseAvailableStock(productId: string, quantity: number) {
    const [stock] = await this.database.db
      .update(inventory)
      .set({
        availableQuantity: sql`
          ${inventory.availableQuantity} - ${quantity}
        `,
        reservedQuantity: sql`
          ${inventory.reservedQuantity} + ${quantity}
        `,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(inventory.productId, productId),
          sql`${inventory.availableQuantity} >= ${quantity}`,
        ),
      )
      .returning();

    return stock ?? null;
  }

  // Create a reservation record
  async createReservation(
    inventoryId: string,
    orderId: string,
    quantity: number,
  ) {
    const [reservation] = await this.database.db
      .insert(inventoryReservations)
      .values({
        inventoryId,
        orderId,
        quantity,
        status: 'RESERVED',
      })
      .returning();

    return reservation;
  }
}
