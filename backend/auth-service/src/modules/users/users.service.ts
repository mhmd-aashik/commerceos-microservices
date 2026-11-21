import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository.js';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    return this.usersRepository.findByEmail(normalizedEmail);
  }

  async register(email: string, password: string, name: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser =
      await this.usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await this.usersRepository.create({
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async findById(id: string) {
    return this.usersRepository.findById(id);
  }
}
