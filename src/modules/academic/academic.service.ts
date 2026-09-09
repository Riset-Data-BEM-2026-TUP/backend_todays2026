import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAcademicDto, UpdateAcademicDto } from './academic.dto';

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.academicPlatform.findMany({ orderBy: [{ urutan: 'asc' }, { nama: 'asc' }] });
  }

  async findOne(id: string) {
    const item = await this.prisma.academicPlatform.findUnique({ where: { id } });
    if (!item) throw new NotFoundException({ code: 'ACADEMIC_NOT_FOUND', message: 'Platform akademik tidak ditemukan' });
    return item;
  }

  create(dto: CreateAcademicDto) {
    return this.prisma.academicPlatform.create({ data: { ...dto, fiturUtama: dto.fiturUtama ?? [] } });
  }

  async update(id: string, dto: UpdateAcademicDto) {
    await this.findOne(id);
    return this.prisma.academicPlatform.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.academicPlatform.delete({ where: { id } });
    return { message: 'Platform akademik berhasil dihapus' };
  }
}
