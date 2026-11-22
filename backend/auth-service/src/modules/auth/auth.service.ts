import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as argon2 from 'argon2';
import { Prisma } from '../../generated/prisma/client.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository.js';
import { createHash, randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async register(email: string, password: string, name: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    let user;

    try {
      user = await this.usersService.createUser({
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }

      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid credentials',
      });
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password);

    if (!isValidPassword || !user.isActive) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid credentials',
      });
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user.id, user.role),
      this.generateRefreshToken(user.id),
    ]);

    await this.storeRefreshToken(user.id, refreshToken);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      accessToken,
      refreshToken,
    };
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        tokenType: 'refresh',
        jti: randomUUID(),
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
        algorithm: 'HS256',
      },
    );
  }

  async refreshTokens(refreshToken: string) {
    let payload: {
      sub: string;
      tokenType: string;
      jti: string;
      exp: number;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (
      !payload.sub ||
      payload.tokenType !== 'refresh' ||
      !payload.jti ||
      typeof payload.exp !== 'number'
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newRefreshToken = await this.generateRefreshToken(user.id);

    const newPayload = this.jwtService.decode(newRefreshToken) as {
      exp: number;
    };

    const rotated = await this.refreshTokensRepository.rotate({
      oldTokenHash: this.hashRefreshToken(refreshToken),
      userId: user.id,
      newTokenHash: this.hashRefreshToken(newRefreshToken),
      expiresAt: new Date(newPayload.exp * 1000),
    });

    if (!rotated) {
      throw new UnauthorizedException('Refresh token expired or already used');
    }

    const accessToken = await this.generateAccessToken(user.id, user.role);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokensRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });
  }

  async generateAccessToken(
    userId: string,
    role: 'CUSTOMER' | 'ADMIN',
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
      role,
      tokenType: 'access',
    });
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    let payload: {
      sub: string;
      tokenType: string;
      jti: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (
      typeof payload.sub !== 'string' ||
      payload.tokenType !== 'refresh' ||
      typeof payload.jti !== 'string'
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    await this.refreshTokensRepository.revoke(payload.sub, tokenHash);

    return { success: true };
  }
}
