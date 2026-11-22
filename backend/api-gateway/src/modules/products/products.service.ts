import {
  Inject,
  Injectable,
  OnModuleInit,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

import type {
  CreateProductRequest,
  UpdateProductRequest,
  ProductGrpcService,
} from './interfaces/product-grpc.interface.js';

@Injectable()
export class ProductsService implements OnModuleInit {
  private productGrpc!: ProductGrpcService;

  constructor(
    @Inject('PRODUCT_GRPC')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productGrpc =
      this.client.getService<ProductGrpcService>('ProductService');
  }

  async create(data: CreateProductRequest) {
    try {
      return await firstValueFrom(this.productGrpc.createProduct(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findAll() {
    try {
      return await firstValueFrom(this.productGrpc.listProducts({}));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findById(id: string) {
    try {
      return await firstValueFrom(this.productGrpc.getProduct({ id }));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async update(id: string, data: Omit<UpdateProductRequest, 'id'>) {
    try {
      return await firstValueFrom(
        this.productGrpc.updateProduct({
          id,
          ...data,
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private handleGrpcError(error: unknown): never {
    const grpcError = error as {
      code?: number;
      details?: string;
    };

    switch (grpcError.code) {
      case status.INVALID_ARGUMENT:
        throw new BadRequestException(grpcError.details);

      case status.ALREADY_EXISTS:
        throw new ConflictException(grpcError.details);

      case status.NOT_FOUND:
        throw new NotFoundException(grpcError.details);

      case status.UNAVAILABLE:
      case status.DEADLINE_EXCEEDED:
        throw new ServiceUnavailableException('Product Service is unavailable');

      default:
        throw new InternalServerErrorException('Product request failed');
    }
  }
}
