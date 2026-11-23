import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class InventoryController {
  @GrpcMethod('InventoryService', 'Ping')
  ping() {
    return {
      message: 'Inventory Service is running',
    };
  }
}
