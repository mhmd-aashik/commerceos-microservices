import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        algorithms: ['HS256'],
      });

      if (
        typeof payload.sub !== 'string' ||
        !payload.sub ||
        payload.tokenType !== 'access' ||
        !['CUSTOMER', 'ADMIN'].includes(payload.role)
      ) {
        throw new UnauthorizedException('Invalid token payload');
      }

      request.user = {
        userId: payload.sub,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
