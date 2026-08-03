import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
      include: { kategori: { select: { nama: true, slug: true } } },
      orderBy: [{ urutan: 'asc' }],
    });
  }

  findKategori() {
    return this.prisma.faqKategori.findMany({ orderBy: { nama: 'asc' } });
  }
}
