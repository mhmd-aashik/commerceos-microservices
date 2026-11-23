import {
  pgTable,
  uuid,
  integer,
  numeric,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { orders } from './orders.schema.js';

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, {
        onDelete: 'cascade',
      }),

    productId: uuid('product_id').notNull(),

    quantity: integer('quantity').notNull(),

    unitPrice: numeric('unit_price', {
      precision: 12,
      scale: 2,
    }).notNull(),

    subtotal: numeric('subtotal', {
      precision: 12,
      scale: 2,
    }).notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('order_items_order_id_idx').on(table.orderId),

    index('order_items_product_id_idx').on(table.productId),

    uniqueIndex('order_items_order_product_uq').on(
      table.orderId,
      table.productId,
    ),

    check('order_items_quantity_positive', sql`${table.quantity} > 0`),

    check('order_items_price_nonnegative', sql`${table.unitPrice} >= 0`),

    check(
      'order_items_subtotal_valid',
      sql`${table.subtotal} = ${table.unitPrice} * ${table.quantity}`,
    ),
  ],
);
