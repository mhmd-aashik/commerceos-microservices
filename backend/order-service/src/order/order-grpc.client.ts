import {
  Inject,
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

import type {
  OrderGrpcService,
  CreateOrderRequest,
  GetOrderRequest,
} from './interfaces/order-grpc.interface.js';

@Injectable()
export class OrderGrpcClient implements OnModuleInit {
  private orderService!: OrderGrpcService;

  constructor(
    @Inject('ORDER_GRPC')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.client.getService<OrderGrpcService>('OrderService');
  }

  async createOrder(request: CreateOrderRequest) {
    try {
      return await firstValueFrom(
        this.orderService.createOrder(request).pipe(timeout(10000)),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOrder(request: GetOrderRequest) {
    try {
      return await firstValueFrom(
        this.orderService.getOrder(request).pipe(timeout(5000)),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof TimeoutError) {
      throw new HttpException(
        'Order Service request timed out',
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    const grpcError = error as {
      code?: number;
      details?: string;
    };

    const statusMap: Record<number, number> = {
      [status.INVALID_ARGUMENT]: 400,
      [status.UNAUTHENTICATED]: 401,
      [status.PERMISSION_DENIED]: 403,
      [status.NOT_FOUND]: 404,
      [status.ALREADY_EXISTS]: 409,
      [status.FAILED_PRECONDITION]: 409,
      [status.UNAVAILABLE]: 503,
      [status.DEADLINE_EXCEEDED]: 504,
    };

    const httpStatus = statusMap[grpcError?.code ?? -1] ?? 500;

    throw new HttpException(
      httpStatus >= 500
        ? 'Order Service request failed'
        : grpcError.details || 'Request failed',
      httpStatus,
    );
  }
}
