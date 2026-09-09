import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Layanan pencarian kelompok untuk publik (guest/maba).
 * Input: NIM (atau nomor pendaftaran sebagai fallback).
 * Output: identitas mahasiswa + identitas kelompok + Menfa + daftar anggota kelompok.
 * Hanya membuka data yang layak publik (nama, NIM, prodi/fakultas) — TIDAK membuka
 * email, no. HP, tanggal lahir, atau kontak darurat.
 */
@Injectable()
export class KelompokService {
  constructor(private prisma: PrismaService) {}

  async searchByNim(nimRaw?: string) {
    const nim = (nimRaw ?? '').trim();
    if (!nim) throw new BadRequestException('NIM wajib diisi');

    const me = await this.prisma.mahasiswa.findFirst({
      where: { OR: [{ nim }, { nomorPendaftaran: nim }] },
      include: {
        fakultas: { select: { nama: true } },
        prodi: { select: { nama: true } },
        kelompok: { include: { pendamping: { select: { nama: true, kontak: true } } } },
      },
    });
    if (!me) {
      throw new NotFoundException('NIM tidak ditemukan. Pastikan NIM yang kamu masukkan benar.');
    }

    // Tentukan cara menghimpun anggota: utamakan relasi kelompok, lalu string noKelompok.
    const where = me.kelompokId
      ? { kelompokId: me.kelompokId }
      : me.noKelompok
        ? { noKelompok: me.noKelompok }
        : { id: me.id };

    const members = await this.prisma.mahasiswa.findMany({
      where,
      orderBy: { nama: 'asc' },
      select: {
        id: true,
        nama: true,
        nim: true,
        nomorPendaftaran: true,
        prodi: { select: { nama: true } },
        fakultas: { select: { nama: true } },
      },
    });

    const namaKelompok = me.kelompok?.nama ?? me.namaKelompok ?? me.noKelompok ?? null;
    const menfa = me.menfa ?? me.kelompok?.pendamping?.nama ?? null;

    // Grup PKKMB official (dari Settings, bukan hardcoded): link + QR image.
    // Ditampilkan sbg CTA "Gabung Grup PKKMB Official" saat hasil pencarian valid.
    const [grupSetting, qrSetting] = await Promise.all([
      this.prisma.settings.findUnique({ where: { key: 'pkkmb.whatsapp_grup' } }),
      this.prisma.settings.findUnique({ where: { key: 'pkkmb.whatsapp_grup_qr' } }),
    ]);
    const rawGroup = grupSetting?.value;
    const rawQr = qrSetting?.value;
    const pkkmbGroupUrl = typeof rawGroup === 'string' && rawGroup.trim() ? rawGroup.trim() : null;
    const pkkmbGroupQr = typeof rawQr === 'string' && rawQr.trim() ? rawQr.trim() : null;

    return {
      pkkmbGroupUrl,
      pkkmbGroupQr,
      mahasiswa: {
        nama: me.nama,
        nim: me.nim ?? me.nomorPendaftaran,
        nomorPendaftaran: me.nomorPendaftaran,
        fakultas: me.fakultas?.nama ?? null,
        prodi: me.prodi?.nama ?? null,
      },
      kelompok: {
        nama: namaKelompok,
        noKelompok: me.noKelompok ?? null,
        menfa,
        whatsappUrl: me.kelompok?.whatsappChannelUrl ?? null,
        jumlahAnggota: members.length,
      },
      anggota: members.map((m) => ({
        id: m.id,
        nama: m.nama,
        nim: m.nim ?? m.nomorPendaftaran,
        prodi: m.prodi?.nama ?? null,
        isMe: m.id === me.id,
      })),
    };
  }
}
