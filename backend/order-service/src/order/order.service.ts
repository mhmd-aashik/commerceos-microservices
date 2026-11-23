import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { status } from '@grpc/grpc-js';
import { isUUID } from 'class-validator';
import { Decimal } from 'decimal.js';

import { OrderRepository } from './repositories/order.repository.js';
import { ProductGrpcClient } from './clients/product-grpc.client.js';

import type {
  CreateOrderRequest,
  CreateOrderItemInput,
} from './interfaces/order.interface.js';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productClient: ProductGrpcClient,
  ) {}

  async createOrder(request: CreateOrderRequest) {
    if (!isUUID(request.userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (
      !Array.isArray(request.items) ||
      request.items.length === 0 ||
      request.items.length > 50
    ) {
      throw new BadRequestException(
        'An order must contain between 1 and 50 items',
      );
    }

    const groupedItems = new Map<string, number>();

    for (const item of request.items) {
      if (!isUUID(item.productId)) {
        throw new BadRequestException('Invalid product ID');
      }

      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
        throw new BadRequestException('Invalid quantity');
      }

      const productId = item.productId.toLowerCase();

      const quantity = (groupedItems.get(productId) ?? 0) + item.quantity;

      if (quantity > 2147483647) {
        throw new BadRequestException('Quantity exceeds supported limit');
      }

      groupedItems.set(productId, quantity);
    }

    const orderItems: CreateOrderItemInput[] = [];

    let totalAmount = new Decimal(0);

    const maxAmount = new Decimal('9999999999.99');

    for (const [productId, quantity] of groupedItems) {
      const product = await this.getProduct(productId);

      if (
        typeof product.price !== 'string' ||
        !/^\d+(\.\d{1,2})?$/.test(product.price)
      ) {
        throw new ServiceUnavailableException('Invalid catalog price');
      }

      const unitPrice = new Decimal(product.price);

      const subtotal = unitPrice.mul(quantity);

      totalAmount = totalAmount.plus(subtotal);

      if (subtotal.gt(maxAmount) || totalAmount.gt(maxAmount)) {
        throw new BadRequestException('Order amount exceeds supported limit');
      }

      orderItems.push({
        productId,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
      });
    }

    return this.orderRepository.createOrder({
      userId: request.userId,
      currency: 'AED',
      totalAmount: totalAmount.toFixed(2),
      items: orderItems,
    });
  }

  async getOrder(orderId: string) {
    if (!isUUID(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private async getProduct(productId: string) {
    try {
      return await this.productClient.getProduct(productId);
    } catch (error) {
      if ((error as { code?: number })?.code === status.NOT_FOUND) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      throw new ServiceUnavailableException('Product Service unavailable');
    }
  }
}
