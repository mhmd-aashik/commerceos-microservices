import type { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  price: string;
  currency: string;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  price?: string;
  isActive?: boolean;
}

export interface ProductGrpcService {
  createProduct(data: CreateProductRequest): Observable<Product>;

  getProduct(data: { id: string }): Observable<Product>;

  listProducts(data: Record<string, never>): Observable<{
    products: Product[];
  }>;

  updateProduct(data: UpdateProductRequest): Observable<Product>;
}
