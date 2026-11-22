import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { products } from '../../../database/schema/products.schema.js';

export type Product = InferSelectModel<typeof products>;

export type NewProduct = InferInsertModel<typeof products>;
