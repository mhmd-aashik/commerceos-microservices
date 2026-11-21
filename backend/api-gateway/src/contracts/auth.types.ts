import { Observable } from 'rxjs';

export interface ValidateUserRequest {
  userId: string;
}

export interface ValidateUserResponse {
  valid: boolean;
}

export interface AuthGrpcService {
  validateUser(request: ValidateUserRequest): Observable<ValidateUserResponse>;
}
