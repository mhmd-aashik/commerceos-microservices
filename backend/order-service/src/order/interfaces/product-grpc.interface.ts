import type { Observable } from 'rxjs';

export interface ProductResponse {
  id: string;
  name: string;
  price: string;
}

export interface ProductGrpcService {
  getProduct(request: { id: string }): Observable<ProductResponse>;
}
