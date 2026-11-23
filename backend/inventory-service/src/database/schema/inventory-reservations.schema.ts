import {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { inventory } from './inventory.schema.js';

export const inventoryReservations = pgTable(
  'inventory_reservations',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    inventoryId: uuid('inventory_id')
      .notNull()
      .references(() => inventory.id),

    orderId: uuid('order_id').notNull(),

    quantity: integer('quantity').notNull(),

    status: varchar('status', {
      length: 20,
    })
      .notNull()
      .default('RESERVED'),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('inventory_reservations_inventory_idx').on(table.inventoryId),

    uniqueIndex('inventory_reservations_order_inventory_uq').on(
      table.orderId,
      table.inventoryId,
    ),

    check('reservation_quantity_positive', sql`${table.quantity} > 0`),

    check(
      'reservation_status_valid',
      sql`${table.status} IN ('RESERVED', 'RELEASED', 'CONFIRMED')`,
    ),
  ],
);
