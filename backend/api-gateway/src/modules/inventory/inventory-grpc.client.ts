import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  InventoryGrpcService,
  CheckStockRequest,
  ReserveStockRequest,
} from './interfaces/inventory.interface.js';

@Injectable()
export class InventoryGrpcClient implements OnModuleInit {
  private inventoryService!: InventoryGrpcService;

  constructor(
    @Inject('INVENTORY_GRPC')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.inventoryService =
      this.client.getService<InventoryGrpcService>('InventoryService');
  }

  async checkStock(request: CheckStockRequest) {
    return firstValueFrom(
      this.inventoryService.checkStock(request).pipe(timeout(5000)),
    );
  }

  async reserveStock(request: ReserveStockRequest) {
    return firstValueFrom(
      this.inventoryService.reserveStock(request).pipe(timeout(5000)),
    );
  }
}
