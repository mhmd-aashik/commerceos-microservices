import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProductsRepository } from './repositories/products.repository.js';
import {
  CreateProductInput,
  UpdateProductInput,
} from './types/product-input.types.js';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(input: CreateProductInput) {
    const name = input.name?.trim();
    const sku = input.sku?.trim().toUpperCase();

    if (!name) {
      throw new BadRequestException('Product name is required');
    }

    if (!sku) {
      throw new BadRequestException('SKU is required');
    }

    this.validatePrice(input.price);

    const existing = await this.productsRepository.findBySku(sku);

    if (existing) {
      throw new ConflictException('SKU already exists');
    }

    try {
      return await this.productsRepository.create({
        name,
        sku,
        description: input.description,
        price: input.price,
        currency: input.currency ?? 'AED',
      });
    } catch (error: unknown) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string) {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findAll() {
    return this.productsRepository.findAll();
  }

  async update(id: string, input: UpdateProductInput) {
    if (input.price !== undefined) {
      this.validatePrice(input.price);
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new BadRequestException('Product name cannot be empty');
    }

    try {
      const product = await this.productsRepository.update(id, {
        ...input,
        ...(input.name !== undefined && {
          name: input.name.trim(),
        }),
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return product;
    } catch (error: unknown) {
      this.handleDatabaseError(error);
    }
  }

  private validatePrice(price: string): void {
    if (
      typeof price !== 'string' ||
      !/^(?:0|[1-9]\d{0,9})\.\d{2}$/.test(price) ||
      /^0\.00$/.test(price)
    ) {
      throw new BadRequestException(
        'Price must be a positive decimal string with two decimal places',
      );
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new ConflictException('SKU already exists');
    }

    throw error;
  }
}
