import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTimelineDto, UpdateTimelineDto } from './dto/timeline.dto';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  /** Hitung status upcoming/ongoing/completed dari waktu server, bukan disimpan. */
  private computeStatus(startAt: Date, endAt: Date | null): 'upcoming' | 'ongoing' | 'completed' {
    const now = Date.now();
    const start = startAt.getTime();
    const end = (endAt ?? startAt).getTime();
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'ongoing';
  }

  async findAll() {
    const events = await this.prisma.timelineEvent.findMany({
      orderBy: [{ urutan: 'asc' }, { startAt: 'asc' }],
    });
    return events.map((e) => ({ ...e, status: this.computeStatus(e.startAt, e.endAt) }));
  }

  async findOne(id: string) {
    const event = await this.prisma.timelineEvent.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException({ code: 'TIMELINE_NOT_FOUND', message: 'Event timeline tidak ditemukan' });
    }
    return { ...event, status: this.computeStatus(event.startAt, event.endAt) };
  }

  async create(dto: CreateTimelineDto) {
    const event = await this.prisma.timelineEvent.create({
      data: {
        judul: dto.judul,
        deskripsi: dto.deskripsi,
        lokasi: dto.lokasi,
        startAt: new Date(dto.startAt),
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        checklistItems: dto.checklistItems,
        dresscode: dto.dresscode,
        attachmentUrl: dto.attachmentUrl,
        urutan: dto.urutan ?? 0,
      },
    });
    return { ...event, status: this.computeStatus(event.startAt, event.endAt) };
  }

  async update(id: string, dto: UpdateTimelineDto) {
    await this.findOne(id);
    const event = await this.prisma.timelineEvent.update({
      where: { id },
      data: {
        ...(dto.judul !== undefined && { judul: dto.judul }),
        ...(dto.deskripsi !== undefined && { deskripsi: dto.deskripsi }),
        ...(dto.lokasi !== undefined && { lokasi: dto.lokasi }),
        ...(dto.startAt !== undefined && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt !== undefined && { endAt: dto.endAt ? new Date(dto.endAt) : null }),
        ...(dto.checklistItems !== undefined && { checklistItems: dto.checklistItems }),
        ...(dto.dresscode !== undefined && { dresscode: dto.dresscode }),
        ...(dto.attachmentUrl !== undefined && { attachmentUrl: dto.attachmentUrl }),
        ...(dto.urutan !== undefined && { urutan: dto.urutan }),
      },
    });
    return { ...event, status: this.computeStatus(event.startAt, event.endAt) };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.timelineEvent.delete({ where: { id } });
    return { message: 'Event timeline berhasil dihapus' };
  }
}
