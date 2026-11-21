import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('validate/:userId')
  async validateUser(@Param('userId') userId: string) {
    const valid = await this.authService.validateUser(userId);

    return {
      userId,
      valid,
    };
  }
}
