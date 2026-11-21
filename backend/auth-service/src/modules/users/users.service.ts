import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { UsersRepository } from './repositories/users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email.trim().toLowerCase());
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.usersRepository.create(data);
  }
}
