import { Injectable } from '@nestjs/common';
import { and, eq, desc } from 'drizzle-orm';

import type {
  CreateOrderInput,
  OrderStatus,
} from '../interfaces/order.interface.js';
import { DatabaseService } from '../../database/database.service.js';
import { orderItems } from '../../database/schema/order-items.schema.js';
import { orders } from '../../database/schema/orders.schema.js';

@Injectable()
export class OrderRepository {
  constructor(private readonly database: DatabaseService) {}

  async createOrder(input: CreateOrderInput) {
    return this.database.db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId: input.userId,
          status: 'PENDING',
          totalAmount: input.totalAmount,
          currency: input.currency,
        })
        .returning();

      const items = await tx
        .insert(orderItems)
        .values(
          input.items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        )
        .returning();

      return {
        ...order,
        items,
      };
    });
  }

  async findById(orderId: string) {
    const [order] = await this.database.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return null;
    }

    const items = await this.database.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return {
      ...order,
      items,
    };
  }

  async findByUserId(userId: string) {
    return this.database.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateStatus(
    orderId: string,
    expectedStatus: OrderStatus,
    newStatus: OrderStatus,
  ) {
    const [updated] = await this.database.db
      .update(orders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(and(eq(orders.id, orderId), eq(orders.status, expectedStatus)))
      .returning();

    return updated ?? null;
  }
}
