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
