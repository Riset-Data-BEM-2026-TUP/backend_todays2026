import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Login = MATCH SELURUH field ke record PMB yang sudah diimpor Admin.
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
