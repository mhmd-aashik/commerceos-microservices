import { Observable } from 'rxjs';

export interface AuthGrpcService {
  validateUser(request: ValidateUserRequest): Observable<ValidateUserResponse>;

  registerUser(data: RegisterUserRequest): Observable<RegisterUserResponse>;

  loginUser(data: LoginUserRequest): Observable<LoginUserResponse>;

  refreshTokens(data: RefreshTokensRequest): Observable<RefreshTokensResponse>;

  logout(data: LogoutRequest): Observable<LogoutResponse>;
}

export interface ValidateUserRequest {
  userId: string;
}

export interface ValidateUserResponse {
  valid: boolean;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterUserResponse {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokensRequest {
  refreshToken: string;
}

export interface RefreshTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
}
