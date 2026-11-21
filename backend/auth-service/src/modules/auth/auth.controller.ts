import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';

interface RegisterUserRequest {
  email: string;
  password: string;
  name: string;
}

@Controller()
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('AuthService', 'RegisterUser')
  async registerUser(data: RegisterUserRequest) {
    try {
      const user = await this.usersService.register(
        data.email,
        data.password,
        data.name,
      );

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'Email already registered',
        });
      }

      throw error;
    }
  }
}
