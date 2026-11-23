import { pgTable, uuid, integer, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    productId: uuid('product_id').notNull().unique(),

    availableQuantity: integer('available_quantity').notNull().default(0),

    reservedQuantity: integer('reserved_quantity').notNull().default(0),

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
    check(
      'available_quantity_non_negative',
      sql`${table.availableQuantity} >= 0`,
    ),
    check(
      'reserved_quantity_non_negative',
      sql`${table.reservedQuantity} >= 0`,
    ),
  ],
);
