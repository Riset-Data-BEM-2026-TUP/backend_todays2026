import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
}
