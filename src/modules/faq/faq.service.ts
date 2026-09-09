import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { category?: string; search?: string; featuredOnly?: boolean }) {
    const { category, search, featuredOnly } = params;
    return this.prisma.faq.findMany({
      where: {
        ...(featuredOnly ? { isFeatured: true } : {}),
        ...(category ? { kategori: { slug: category } } : {}),
        ...(search
          ? { OR: [{ pertanyaan: { contains: search, mode: 'insensitive' } }, { jawaban: { contains: search, mode: 'insensitive' } }] }
          : {}),
      },
      include: { kategori: { select: { id: true, nama: true, slug: true } } },
      orderBy: [{ urutan: 'asc' }],
    });
  }

  async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({
      where: { id },
      include: { kategori: { select: { id: true, nama: true, slug: true } } },
    });
    if (!faq) {
      throw new NotFoundException({ code: 'FAQ_NOT_FOUND', message: 'FAQ tidak ditemukan' });
    }
    return faq;
  }

  findKategori() {
    return this.prisma.faqKategori.findMany({ orderBy: { nama: 'asc' } });
  }

  async create(dto: CreateFaqDto) {
    const kategoriExists = await this.prisma.faqKategori.findUnique({ where: { id: dto.kategoriId } });
    if (!kategoriExists) {
      throw new NotFoundException({ code: 'KATEGORI_NOT_FOUND', message: 'Kategori FAQ tidak ditemukan' });
    }

    return this.prisma.faq.create({
      data: {
        kategoriId: dto.kategoriId,
        pertanyaan: dto.pertanyaan,
        jawaban: dto.jawaban,
        isFeatured: dto.isFeatured ?? false,
        urutan: dto.urutan ?? 0,
      },
      include: { kategori: { select: { id: true, nama: true, slug: true } } },
    });
  }

  async update(id: string, dto: UpdateFaqDto) {
    await this.findOne(id);

    if (dto.kategoriId) {
      const kategoriExists = await this.prisma.faqKategori.findUnique({ where: { id: dto.kategoriId } });
      if (!kategoriExists) {
        throw new NotFoundException({ code: 'KATEGORI_NOT_FOUND', message: 'Kategori FAQ tidak ditemukan' });
      }
    }

    return this.prisma.faq.update({
      where: { id },
      data: {
        ...(dto.kategoriId !== undefined && { kategoriId: dto.kategoriId }),
        ...(dto.pertanyaan !== undefined && { pertanyaan: dto.pertanyaan }),
        ...(dto.jawaban !== undefined && { jawaban: dto.jawaban }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.urutan !== undefined && { urutan: dto.urutan }),
      },
      include: { kategori: { select: { id: true, nama: true, slug: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.faq.delete({ where: { id } });
    return { message: 'FAQ berhasil dihapus' };
  }
}
