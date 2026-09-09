import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const rows = await this.prisma.settings.findMany();
    return rows.reduce<Record<string, unknown>>((acc, r) => ((acc[r.key] = r.value), acc), {});
  }

  /** Daftar setting bentuk baris (untuk panel admin). */
  async list() {
    return this.prisma.settings.findMany({ orderBy: { key: 'asc' } });
  }

  /** Upsert satu setting (CRUD dari panel admin). value disimpan sebagai JSON. */
  async set(key: string, value: unknown) {
    const row = await this.prisma.settings.upsert({
      where: { key },
      update: { value: value as never },
      create: { key, value: value as never },
    });
    return { key: row.key, value: row.value };
  }

  async remove(key: string) {
    await this.prisma.settings.delete({ where: { key } }).catch(() => null);
    return { message: 'Setting dihapus' };
  }
}
