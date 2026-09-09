import { Body, Controller, Get, HttpCode, Ip, Post, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  // Login KHUSUS ADMIN (Email + Password). Login mahasiswa/panitia sudah ditiadakan.
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @Post('admin/login')
  @HttpCode(200)
  async adminLogin(@Body() dto: AdminLoginDto, @Ip() ip: string, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.service.adminLogin(dto, ip);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  // Mengambil profil user yang sedang login
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.service.getMe(userId);
  }

  // Refresh access token menggunakan cookie refresh_token
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      throw new UnauthorizedException({ code: 'MISSING_REFRESH_TOKEN', message: 'Cookie refresh_token tidak ditemukan' });
    }
    const { accessToken, refreshToken } = await this.service.refreshToken(token);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  // Logout (membersihkan cookie refresh token)
  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
    return { message: 'Berhasil logout' };
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });
  }
}
