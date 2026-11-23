export interface CheckStockRequest {
  productId: string;
  quantity: number;
}

export interface ReserveStockRequest {
  productId: string;
  orderId: string;
  quantity: number;
}
