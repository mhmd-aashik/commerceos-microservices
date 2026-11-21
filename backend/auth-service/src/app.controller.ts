import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  ValidateUserRequest,
  ValidateUserResponse,
} from './contracts/auth.types.js';

@Controller()
export class AppController {
  @GrpcMethod('AuthService', 'ValidateUser')
  validateUser(data: ValidateUserRequest): ValidateUserResponse {
    return {
      valid: Boolean(data.userId),
    };
  }
}
