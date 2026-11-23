import { Controller, HttpException } from '@nestjs/common';

import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { status } from '@grpc/grpc-js';

import { OrderService } from './order.service.js';

import type {
  CreateOrderRequest,
  GetOrderRequest,
} from './interfaces/order.interface.js';

@Controller()
export class OrderGrpcController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'CreateOrder')
  async createOrder(request: CreateOrderRequest) {
    try {
      return await this.orderService.createOrder(request);
    } catch (error) {
      this.handleError(error);
    }
  }

  @GrpcMethod('OrderService', 'GetOrder')
  async getOrder(request: GetOrderRequest) {
    try {
      return await this.orderService.getOrder(request.orderId);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof HttpException) {
      const codes: Record<number, number> = {
        400: status.INVALID_ARGUMENT,
        404: status.NOT_FOUND,
        409: status.FAILED_PRECONDITION,
        503: status.UNAVAILABLE,
      };

      throw new RpcException({
        code: codes[error.getStatus()] ?? status.INTERNAL,
        message: error.message,
      });
    }

    throw new RpcException({
      code: status.INTERNAL,
      message: 'Internal server error',
    });
  }
}
