import { Body, Controller, HttpCode, Ip, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  // Rate limit ketat: maks 5 percobaan / 15 menit / IP
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.service.login(dto, ip);
    // refresh token disimpan sebagai httpOnly cookie (tidak diakses JS)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
    return { accessToken };
  }
}
