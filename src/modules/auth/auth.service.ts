import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Login Mahasiswa = MATCH SELURUH field ke record PMB yang sudah diimpor Admin.
   * Kombinasi harus cocok semuanya (mencegah brute-force menebak satu field).
   * Semua percobaan (gagal/berhasil) dicatat di audit_log.
   */
  async login(dto: LoginDto, ip?: string) {
    const mhs = await this.prisma.mahasiswa.findUnique({
      where: { nomorPendaftaran: dto.nomorPendaftaran },
      include: { user: true, fakultas: true, prodi: true },
    });

    const sameDay = (a?: Date, b?: string) =>
      !!a && !!b && a.toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);

    const matched =
      !!mhs &&
      mhs.user.email.toLowerCase() === dto.email.toLowerCase() &&
      (mhs.user.phone ?? '') === dto.noHp &&
      mhs.fakultas.nama.toLowerCase() === dto.fakultas.toLowerCase() &&
      mhs.prodi.nama.toLowerCase() === dto.prodi.toLowerCase() &&
      sameDay(mhs.tanggalLahir, dto.tanggalLahir);

    await this.prisma.auditLog.create({
      data: {
        actorId: matched ? mhs!.user.id : null,
        action: matched ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        entity: 'auth',
        entityId: dto.nomorPendaftaran,
        ip: ip ?? null,
      },
    });

    if (!matched) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Data tidak cocok dengan sistem PMB' });
    }

    await this.prisma.user.update({ where: { id: mhs!.user.id }, data: { lastLoginAt: new Date() } });
    return this.issueTokens(mhs!.user.id, mhs!.user.role);
  }

  /**
   * Login Admin berbasis Email & Password (Argon2id).
   * Hanya akun ber-role admin yang diizinkan masuk (mahasiswa & panitia ditiadakan).
   */
  async adminLogin(dto: AdminLoginDto, ip?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    let isValid = false;
    if (user && user.isActive && user.passwordHash) {
      isValid = await argon2.verify(user.passwordHash, dto.password);
    }

    // Hanya izinkan akun ADMIN untuk login via email+password.
    const staffRoles: Role[] = [Role.admin];
    const isStaffRole = !!user && staffRoles.includes(user.role);

    await this.prisma.auditLog.create({
      data: {
        actorId: isValid && isStaffRole ? user!.id : null,
        action: isValid && isStaffRole ? 'ADMIN_LOGIN_SUCCESS' : 'ADMIN_LOGIN_FAILED',
        entity: 'auth',
        entityId: dto.email,
        ip: ip ?? null,
      },
    });

    if (!isValid || !isStaffRole) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Email atau password salah' });
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.issueTokens(user.id, user.role);
  }

  /**
   * Mengambil detail profil user yang sedang login beserta relasinya (Mahasiswa / Pendamping).
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mahasiswa: {
          include: {
            fakultas: true,
            prodi: true,
            kelompok: true,
          },
        },
        pendamping: {
          include: {
            kelompok: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User tidak ditemukan' });
    }

    // Hilangkan passwordHash dari respon untuk keamanan
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Refresh access token menggunakan refresh token yang valid.
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; role: string; typ?: string }>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      if (payload.typ !== 'refresh') {
        throw new UnauthorizedException({ code: 'INVALID_TOKEN_TYPE', message: 'Token bukan refresh token' });
      }

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException({ code: 'USER_INACTIVE', message: 'Akun tidak aktif atau tidak ditemukan' });
      }

      return this.issueTokens(user.id, user.role);
    } catch {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token tidak valid atau telah kadaluarsa' });
    }
  }

  private async issueTokens(sub: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub, role },
      { secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn: this.config.get('JWT_ACCESS_TTL') },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub, role, typ: 'refresh' },
      { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_TTL') },
    );
    return { accessToken, refreshToken };
  }
}
