import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { Prisma } from '../../../generated/prisma/client.js';

@Injectable()
export class RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({
      data,
    });
  }

  async findByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async rotate(data: {
    oldTokenHash: string;
    userId: string;
    newTokenHash: string;
    expiresAt: Date;
  }): Promise<boolean> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const result = await tx.refreshToken.updateMany({
          where: {
            tokenHash: data.oldTokenHash,
            userId: data.userId,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: {
            revokedAt: new Date(),
          },
        });

        if (result.count !== 1) {
          return false;
        }

        await tx.refreshToken.create({
          data: {
            userId: data.userId,
            tokenHash: data.newTokenHash,
            expiresAt: data.expiresAt,
          },
        });

        return true;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        // Transaction conflict: caller may retry the entire operation
        // with a new token, but never blindly retry indefinitely.
      }

      throw error;
    }
  }
}
