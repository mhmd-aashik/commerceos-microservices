export interface JwtPayload {
  sub: string;
  role: UserRole;
  tokenType: 'access';
  iat?: number;
  exp?: number;
}

export type UserRole = 'CUSTOMER' | 'ADMIN';
