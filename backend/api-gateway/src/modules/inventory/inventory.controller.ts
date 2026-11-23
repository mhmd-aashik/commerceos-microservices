import { Body, Controller, Post } from '@nestjs/common';

import { InventoryGrpcClient } from './inventory-grpc.client.js';
import { CheckStockDto } from './dto/check-stock.dto.js';
import { ReserveStockDto } from './dto/reserve-stock.dto.js';
import { InitializeStockDto } from './dto/initialize-stock.dto.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryClient: InventoryGrpcClient) {}

  @Post('check')
  checkStock(@Body() dto: CheckStockDto) {
    return this.inventoryClient.checkStock(dto);
  }

  @Post('reserve')
  reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryClient.reserveStock(dto);
  }

  @Post('initialize')
  initializeStock(@Body() dto: InitializeStockDto) {
    return this.inventoryClient.initializeStock(dto);
  }
}
