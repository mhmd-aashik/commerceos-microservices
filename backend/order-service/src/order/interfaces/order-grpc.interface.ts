import type { Observable } from 'rxjs';

export interface CreateOrderRequest {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface GetOrderRequest {
  orderId: string;
  userId: string;
}

export interface OrderResponse {
  id: string;
  userId: string;
  status: string;
  totalAmount: string;
  currency: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];
}

export interface OrderGrpcService {
  createOrder(request: CreateOrderRequest): Observable<OrderResponse>;

  getOrder(request: GetOrderRequest): Observable<OrderResponse>;
}
