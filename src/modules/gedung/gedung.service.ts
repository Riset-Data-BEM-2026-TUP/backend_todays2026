import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGedungDto, UpdateGedungDto } from './gedung.dto';

@Injectable()
export class GedungService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.gedung.findMany({ orderBy: [{ urutan: 'asc' }, { nama: 'asc' }] });
  }

  async findOne(id: string) {
    const item = await this.prisma.gedung.findUnique({ where: { id } });
    if (!item) throw new NotFoundException({ code: 'GEDUNG_NOT_FOUND', message: 'Gedung/lokasi tidak ditemukan' });
    return item;
  }

  create(dto: CreateGedungDto) {
    return this.prisma.gedung.create({ data: { ...dto, fasilitas: dto.fasilitas ?? [] } });
  }

  async update(id: string, dto: UpdateGedungDto) {
    await this.findOne(id);
    return this.prisma.gedung.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.gedung.delete({ where: { id } });
    return { message: 'Gedung/lokasi berhasil dihapus' };
  }
}
