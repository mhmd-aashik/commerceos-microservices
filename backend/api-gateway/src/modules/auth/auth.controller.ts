import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';

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

  @Post('register')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
