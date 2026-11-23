import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async reserveStock(productId: string, orderId: string, quantity: number) {
    return this.database.db.transaction(async (tx) => {
      // 1. Atomically update available and reserved stock
      const [stock] = await tx
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

      if (!stock) {
        throw new ConflictException('Product not found or insufficient stock');
      }

      // 2. Create the reservation in the SAME transaction
      const [reservation] = await tx
        .insert(inventoryReservations)
        .values({
          inventoryId: stock.id,
          orderId,
          quantity,
          status: 'RESERVED',
        })
        .returning();

      return {
        reservationId: reservation.id,
        productId: stock.productId,
        orderId,
        quantity,
        availableQuantity: stock.availableQuantity,
        reservedQuantity: stock.reservedQuantity,
        status: reservation.status,
      };
    });
  }

  async releaseStock(reservationId: string) {
    return this.database.db.transaction(async (tx) => {
      // Lock the reservation until this transaction finishes
      const [reservation] = await tx
        .select()
        .from(inventoryReservations)
        .where(eq(inventoryReservations.id, reservationId))
        .for('update');

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      if (reservation.status !== 'RESERVED') {
        throw new ConflictException(
          `Cannot release a ${reservation.status} reservation`,
        );
      }

      // Return the reserved quantity to available stock
      const [stock] = await tx
        .update(inventory)
        .set({
          availableQuantity: sql`
          ${inventory.availableQuantity} + ${reservation.quantity}
        `,
          reservedQuantity: sql`
          ${inventory.reservedQuantity} - ${reservation.quantity}
        `,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(inventory.id, reservation.inventoryId),
            sql`
            ${inventory.reservedQuantity} >=
            ${reservation.quantity}
          `,
          ),
        )
        .returning();

      if (!stock) {
        throw new ConflictException('Inventory stock is inconsistent');
      }

      // Mark the reservation as released
      await tx
        .update(inventoryReservations)
        .set({
          status: 'RELEASED',
          updatedAt: new Date(),
        })
        .where(eq(inventoryReservations.id, reservationId));

      return {
        reservationId,
        status: 'RELEASED',
        availableQuantity: stock.availableQuantity,
        reservedQuantity: stock.reservedQuantity,
      };
    });
  }

  async confirmStock(reservationId: string) {
    return this.database.db.transaction(async (tx) => {
      const [reservation] = await tx
        .select()
        .from(inventoryReservations)
        .where(eq(inventoryReservations.id, reservationId))
        .for('update');

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      if (reservation.status !== 'RESERVED') {
        throw new ConflictException(
          `Cannot confirm a ${reservation.status} reservation`,
        );
      }

      // Reserved units become permanently sold
      const [stock] = await tx
        .update(inventory)
        .set({
          reservedQuantity: sql`
          ${inventory.reservedQuantity} - ${reservation.quantity}
        `,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(inventory.id, reservation.inventoryId),
            sql`
            ${inventory.reservedQuantity} >=
            ${reservation.quantity}
          `,
          ),
        )
        .returning();

      if (!stock) {
        throw new ConflictException('Inventory stock is inconsistent');
      }

      await tx
        .update(inventoryReservations)
        .set({
          status: 'CONFIRMED',
          updatedAt: new Date(),
        })
        .where(eq(inventoryReservations.id, reservationId));

      return {
        reservationId,
        status: 'CONFIRMED',
        availableQuantity: stock.availableQuantity,
        reservedQuantity: stock.reservedQuantity,
      };
    });
  }
}
