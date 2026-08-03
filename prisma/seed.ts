import { PrismaClient } from '@prisma/client';

/**
 * Seed HANYA untuk dev/staging (di-gate NODE_ENV).
 * Isi ini adalah DATA AWAL yang di produksi seharusnya diinput lewat Dashboard Admin,
 * bukan hardcode di frontend. Aman dijalankan berulang (upsert).
 */
const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Seed dilewati di production.');
    return;
  }

  // ---------- Timeline (agenda dari brief) ----------
  const timeline = [
    {
      judul: 'Pembagian Jas Almamater & Foto KTM',
      deskripsi:
        'Mahasiswa baru mengambil jas almamater serta sesi foto untuk pembuatan Kartu Tanda Mahasiswa (KTM).',
      lokasi: 'Lobby Gedung Utama',
      startAt: new Date('2026-09-03T08:00:00+07:00'),
      endAt: new Date('2026-09-04T16:00:00+07:00'),
      checklistItems: ['Bukti registrasi', 'KTP/Kartu Identitas', 'Bukti pembayaran (jika diperlukan)'],
      urutan: 1,
    },
    {
      judul: 'PRA TODAYS',
      deskripsi:
        'Kegiatan pra-PKKMB: pengarahan teknis, pembagian kelompok, pengenalan panitia, dan simulasi kegiatan.',
      lokasi: 'Auditorium',
      startAt: new Date('2026-09-05T08:00:00+07:00'),
      endAt: new Date('2026-09-05T15:00:00+07:00'),
      urutan: 2,
    },
    {
      judul: 'Pembelajaran Mandiri melalui LMS',
      deskripsi:
        'Pembelajaran mandiri via LMS Telkom University: Kehidupan Kampus, Budaya Akademik, Etika Mahasiswa, Bela Negara, Pencegahan Kekerasan Seksual, Anti Narkoba, Literasi Digital.',
      lokasi: 'LMS Telkom University',
      startAt: new Date('2026-09-06T00:00:00+07:00'),
      endAt: new Date('2026-09-08T23:59:00+07:00'),
      urutan: 3,
    },
    {
      judul: 'TODAYS — Day 1',
      deskripsi: 'Opening Ceremony, Sambutan Rektor, Pengenalan Universitas, Pengenalan Fakultas, Seminar Inspiratif.',
      lokasi: 'Auditorium',
      startAt: new Date('2026-09-09T08:00:00+07:00'),
      endAt: new Date('2026-09-09T16:00:00+07:00'),
      urutan: 4,
    },
    {
      judul: 'TODAYS — Day 2',
      deskripsi: 'Character Building, Campus Life, Pengenalan Organisasi Mahasiswa, Penutupan PKKMB.',
      lokasi: 'Auditorium',
      startAt: new Date('2026-09-10T08:00:00+07:00'),
      endAt: new Date('2026-09-10T16:00:00+07:00'),
      urutan: 5,
    },
  ];
  // reset timeline supaya idempotent
  await prisma.timelineEvent.deleteMany();
  await prisma.timelineEvent.createMany({ data: timeline });

  // ---------- FAQ kategori + contoh FAQ ----------
  const kategoriData = [
    { nama: 'Akademik', slug: 'akademik' },
    { nama: 'Perlengkapan', slug: 'perlengkapan' },
    { nama: 'Kesehatan', slug: 'kesehatan' },
    { nama: 'Transportasi', slug: 'transportasi' },
    { nama: 'Penugasan', slug: 'penugasan' },
    { nama: 'Kelompok', slug: 'kelompok' },
  ];
  for (const k of kategoriData) {
    await prisma.faqKategori.upsert({ where: { slug: k.slug }, update: {}, create: k });
  }
  const perlengkapan = await prisma.faqKategori.findUnique({ where: { slug: 'perlengkapan' } });
  const akademik = await prisma.faqKategori.findUnique({ where: { slug: 'akademik' } });

  await prisma.faq.deleteMany();
  await prisma.faq.createMany({
    data: [
      {
        kategoriId: perlengkapan!.id,
        pertanyaan: 'Apa saja yang perlu dibawa saat pembagian jas almamater?',
        jawaban: 'Bukti registrasi, KTP/kartu identitas, dan bukti pembayaran bila diminta panitia.',
        isFeatured: true,
        urutan: 1,
      },
      {
        kategoriId: akademik!.id,
        pertanyaan: 'Di mana materi pembelajaran mandiri diakses?',
        jawaban: 'Seluruh materi PKKMB diakses melalui LMS Telkom University pada 6–8 September 2026.',
        isFeatured: true,
        urutan: 2,
      },
    ],
  });

  // ---------- Settings (konten "Tentang BHUMARA", kontak, footer) ----------
  const settings: { key: string; value: any }[] = [
    { key: 'about.filosofi', value: 'BHUMARA berangkat dari kata "bhumi" (bumi) — tempat tumbuh, berakar, dan berkembang.' },
    { key: 'about.tema', value: 'Growing Today, Thriving Tomorrow' },
    { key: 'about.makna_logo', value: 'Api semangat dan sosok yang meraih tumbuh melambangkan pergerakan mahasiswa baru.' },
    { key: 'about.makna_maskot', value: 'Maskot merepresentasikan petualang muda yang menjelajah dunia kampus.' },
    { key: 'contact.instagram', value: 'https://instagram.com/pkkmb.telkompwt' },
    { key: 'contact.email', value: 'pkkmb@telkomuniversity.ac.id' },
    { key: 'contact.whatsapp', value: 'https://wa.me/6280000000000' },
    { key: 'contact.alamat', value: 'Jl. DI Panjaitan No.128, Purwokerto, Jawa Tengah' },
    { key: 'footer.copyright', value: `© ${new Date().getFullYear()} BHUMARA — PKKMB Telkom University Purwokerto` },
  ];
  for (const s of settings) {
    await prisma.settings.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }

  // ---------- Fakultas & Prodi contoh (untuk uji login match PMB) ----------
  const fif = await prisma.fakultas.upsert({
    where: { nama: 'Fakultas Informatika' },
    update: {},
    create: { nama: 'Fakultas Informatika', kode: 'FIF' },
  });
  await prisma.programStudi.upsert({
    where: { nama_fakultasId: { nama: 'S1 Informatika', fakultasId: fif.id } },
    update: {},
    create: { nama: 'S1 Informatika', fakultasId: fif.id },
  });

  console.log('Seed selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
