import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

import { InventoryService } from './inventory.service.js';

import type {
  CheckStockRequest,
  ReserveStockRequest,
} from './interfaces/inventory-grpc.interface.js';

@Controller()
export class InventoryGrpcController {
  constructor(private readonly inventoryService: InventoryService) {}

  @GrpcMethod('InventoryService', 'CheckStock')
  async checkStock(data: CheckStockRequest) {
    try {
      return await this.inventoryService.checkStock(
        data.productId,
        data.quantity,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @GrpcMethod('InventoryService', 'ReserveStock')
  async reserveStock(data: ReserveStockRequest) {
    try {
      return await this.inventoryService.reserveStock(
        data.productId,
        data.orderId,
        data.quantity,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof HttpException) {
      const httpStatus = error.getStatus();

      const grpcCode =
        httpStatus === HttpStatus.BAD_REQUEST
          ? status.INVALID_ARGUMENT
          : httpStatus === HttpStatus.NOT_FOUND
            ? status.NOT_FOUND
            : httpStatus === HttpStatus.CONFLICT
              ? status.FAILED_PRECONDITION
              : status.INTERNAL;

      throw new RpcException({
        code: grpcCode,
        message: error.message,
      });
    }

    throw new RpcException({
      code: status.INTERNAL,
      message: 'Internal inventory service error',
    });
  }

  @GrpcMethod('InventoryService', 'ReleaseStock')
  async releaseStock(data: { reservationId: string }) {
    try {
      return await this.inventoryService.releaseStock(data.reservationId);
    } catch (error) {
      this.handleError(error);
    }
  }

  @GrpcMethod('InventoryService', 'ConfirmStock')
  async confirmStock(data: { reservationId: string }) {
    try {
      return await this.inventoryService.confirmStock(data.reservationId);
    } catch (error) {
      this.handleError(error);
    }
  }

  @GrpcMethod('InventoryService', 'InitializeStock')
  async initializeStock(data: { productId: string; initialQuantity: number }) {
    try {
      const stock = await this.inventoryService.initializeStock(
        data.productId,
        data.initialQuantity,
      );

      return {
        inventoryId: stock.id,
        productId: stock.productId,
        availableQuantity: stock.availableQuantity,
        reservedQuantity: stock.reservedQuantity,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
