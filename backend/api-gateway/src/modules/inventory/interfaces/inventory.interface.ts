import type { Observable } from 'rxjs';

export interface CheckStockRequest {
  productId: string;
  quantity: number;
}

export interface CheckStockResponse {
  productId: string;
  requestedQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  isAvailable: boolean;
}

export interface ReserveStockRequest {
  productId: string;
  orderId: string;
  quantity: number;
}

export interface ReserveStockResponse {
  reservationId: string;
  productId: string;
  orderId: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  status: string;
}

export interface InventoryGrpcService {
  checkStock(request: CheckStockRequest): Observable<CheckStockResponse>;

  reserveStock(request: ReserveStockRequest): Observable<ReserveStockResponse>;
}
