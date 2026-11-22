import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { HttpException, HttpStatus } from '@nestjs/common';

import { ProductsService } from './products.service.js';

import type {
  CreateProductInput,
  UpdateProductInput,
} from './types/product-input.types.js';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @GrpcMethod('ProductService', 'CreateProduct')
  async createProduct(data: CreateProductInput) {
    try {
      const product = await this.productsService.create(data);
      return this.toResponse(product);
    } catch (error) {
      this.handleError(error);
    }
  }

  @GrpcMethod('ProductService', 'GetProduct')
  async getProduct(data: { id: string }) {
    try {
      const product = await this.productsService.findById(data.id);
      return this.toResponse(product);
    } catch (error) {
      this.handleError(error);
    }
  }

  @GrpcMethod('ProductService', 'ListProducts')
  async listProducts() {
    try {
      const products = await this.productsService.findAll();

      return {
        products: products.map((product) => this.toResponse(product)),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @GrpcMethod('ProductService', 'UpdateProduct')
  async updateProduct(data: UpdateProductInput & { id: string }) {
    try {
      const { id, ...input } = data;

      const product = await this.productsService.update(id, input);

      return this.toResponse(product);
    } catch (error) {
      this.handleError(error);
    }
  }

  private toResponse(product: {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    price: string;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description ?? '',
      price: product.price,
      currency: product.currency,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private handleError(error: unknown): never {
    if (error instanceof HttpException) {
      const code =
        error.getStatus() === HttpStatus.NOT_FOUND
          ? status.NOT_FOUND
          : error.getStatus() === HttpStatus.CONFLICT
            ? status.ALREADY_EXISTS
            : error.getStatus() === HttpStatus.BAD_REQUEST
              ? status.INVALID_ARGUMENT
              : status.INTERNAL;

      throw new RpcException({
        code,
        message: error.message,
      });
    }

    throw new RpcException({
      code: status.INTERNAL,
      message: 'Internal server error',
    });
  }
}
