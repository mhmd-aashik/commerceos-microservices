import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull(),

    status: varchar('status', { length: 30 }).notNull().default('PENDING'),

    totalAmount: numeric('total_amount', {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default('0.00'),

    currency: varchar('currency', { length: 3 }).notNull().default('AED'),

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
    index('orders_user_id_idx').on(table.userId),
    index('orders_status_idx').on(table.status),

    check('orders_total_nonnegative', sql`${table.totalAmount} >= 0`),

    check(
      'orders_status_valid',
      sql`${table.status} IN (
       'PENDING',
       'RESERVED',
       'CONFIRMED',
       'CANCELLED',
       'FAILED'
     )`,
    ),
  ],
);
