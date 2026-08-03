import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const rows = await this.prisma.settings.findMany();
    return rows.reduce<Record<string, unknown>>((acc, r) => ((acc[r.key] = r.value), acc), {});
  }
}
