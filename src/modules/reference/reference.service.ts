import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReferenceService {
  constructor(private prisma: PrismaService) {}

  /** Daftar fakultas beserta program studinya — sumber data dropdown login Maba. */
  async getFakultas() {
    return this.prisma.fakultas.findMany({
      orderBy: { nama: 'asc' },
      select: {
        id: true,
        nama: true,
        kode: true,
        prodi: {
          orderBy: { nama: 'asc' },
          select: { id: true, nama: true },
        },
      },
    });
  }
}
