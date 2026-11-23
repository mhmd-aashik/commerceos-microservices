export type OrderStatus =
  'PENDING' | 'RESERVED' | 'CONFIRMED' | 'CANCELLED' | 'FAILED';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface CreateOrderInput {
  userId: string;
  totalAmount: string;
  currency: string;
  items: CreateOrderItemInput[];
}

export interface CreateOrderRequest {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface GetOrderRequest {
  orderId: string;
}
