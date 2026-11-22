export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  price: string;
  currency?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: string;
  isActive?: boolean;
}
