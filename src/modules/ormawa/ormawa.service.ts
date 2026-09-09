import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrmawaDto, UpdateOrmawaDto } from './ormawa.dto';

@Injectable()
export class OrmawaService {
  constructor(private prisma: PrismaService) {}

  /** Daftar ormawa/UKM publik, dengan filter kategori & pencarian opsional. */
  async list(params?: { kategori?: string; search?: string }) {
    const q = params?.search?.trim();
    return this.prisma.ormawa.findMany({
      where: {
        ...(params?.kategori ? { kategori: params.kategori } : {}),
        ...(q
          ? { OR: [{ nama: { contains: q, mode: 'insensitive' } }, { deskripsi: { contains: q, mode: 'insensitive' } }] }
          : {}),
      },
      orderBy: { nama: 'asc' },
    });
  }

  async getBySlug(slug: string) {
    const item = await this.prisma.ormawa.findUnique({
      where: { slug },
      include: { galeri: true },
    });
    if (!item) throw new NotFoundException({ code: 'ORMAWA_NOT_FOUND', message: 'Ormawa tidak ditemukan' });
    return item;
  }

  async findById(id: string) {
    const item = await this.prisma.ormawa.findUnique({ where: { id } });
    if (!item) throw new NotFoundException({ code: 'ORMAWA_NOT_FOUND', message: 'Ormawa tidak ditemukan' });
    return item;
  }

  create(dto: CreateOrmawaDto) {
    return this.prisma.ormawa.create({ data: dto });
  }

  async update(id: string, dto: UpdateOrmawaDto) {
    await this.findById(id);
    return this.prisma.ormawa.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.ormawa.delete({ where: { id } });
    return { message: 'Ormawa berhasil dihapus' };
  }
}
