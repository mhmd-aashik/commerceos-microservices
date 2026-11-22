import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';

import { DatabaseService } from '../../../database/database.service.js';
import { products } from '../../../database/schema/products.schema.js';

import type { NewProduct, Product } from '../types/product.types.js';

@Injectable()
export class ProductsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: NewProduct): Promise<Product> {
    const [product] = await this.database.db
      .insert(products)
      .values(data)
      .returning();

    return product;
  }

  async findById(id: string): Promise<Product | null> {
    const [product] = await this.database.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return product ?? null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [product] = await this.database.db
      .select()
      .from(products)
      .where(eq(products.sku, sku))
      .limit(1);

    return product ?? null;
  }

  async findAll(): Promise<Product[]> {
    return this.database.db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));
  }

  async update(id: string, data: Partial<NewProduct>): Promise<Product | null> {
    const [product] = await this.database.db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return product ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.database.db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return deleted.length > 0;
  }
}
