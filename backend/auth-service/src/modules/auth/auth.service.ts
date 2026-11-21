import { ConflictException, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as argon2 from 'argon2';
import { Prisma } from '../../generated/prisma/client.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
      this.generateAccessToken(user.id),
      this.generateRefreshToken(user.id),
    ]);

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
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
        algorithm: 'HS256',
      },
    );
  }

  async generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
    });
  }
}
