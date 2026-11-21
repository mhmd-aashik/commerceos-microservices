import { ConflictException, Controller } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UsersService } from '../users/users.service.js';
import { RegisterUserDto } from '../users/dto/register-user.dto.js';

@Controller()
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('AuthService', 'RegisterUser')
  async registerUser(data: RegisterUserDto) {
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
