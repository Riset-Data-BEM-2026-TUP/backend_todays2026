import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Seed HANYA untuk dev/staging (di-gate NODE_ENV).
 * Menyediakan data awal lengkap untuk pengujian:
 * 1. Timeline Kegiatan PKKMB
 * 2. FAQ Kategori & Pertanyaan
 * 3. Settings Aplikasi BHUMARA
 * 4. Master Fakultas & Program Studi (FIF, FTTE, FRID)
 * 5. Master Kelompok & Pendamping
 * 6. User Admin & Super Admin (lengkap dengan password terenkripsi Argon2)
 * 7. User Mahasiswa Baru (Maba) + Data PMB (siap login via match PMB)
 *
 * Aman dijalankan berulang kali (Idempotent via upsert).
 */
const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.FORCE_SEED) {
    console.log('Seed dilewati di production (atur FORCE_SEED=true jika ingin memaksa).');
    return;
  }

  console.log('🌱 Memulai proses seeding database BHUMARA...');

  // =========================================================================
  // 1. TIMELINE (Agenda PKKMB BHUMARA 2026)
  // =========================================================================
  console.log('⏳ Seeding Timeline Events...');
  const timeline = [
    {
      judul: 'Pembagian Jas Almamater & Foto KTM',
      deskripsi:
        'Mahasiswa baru mengambil jas almamater serta sesi foto untuk pembuatan Kartu Tanda Mahasiswa (KTM).',
      lokasi: 'Telkom University Purwokerto',
      startAt: new Date('2026-09-03T08:00:00+07:00'),
      endAt: new Date('2026-09-04T16:00:00+07:00'),
      checklistItems: ['Bukti registrasi', 'KTP/Kartu Identitas', 'Bukti pembayaran (jika diperlukan)'],
      urutan: 1,
    },
    {
      judul: 'PRA PKKMB',
      deskripsi:
        'Kegiatan pra-PKKMB: pengarahan teknis, pembagian kelompok, pengenalan panitia, dan simulasi kegiatan.',
      lokasi: 'Telkom University Purwokerto',
      startAt: new Date('2026-09-05T08:00:00+07:00'),
      endAt: new Date('2026-09-05T15:00:00+07:00'),
      urutan: 2,
    },
    {
      judul: 'PKKMB — Day 1',
      deskripsi: 'Opening Ceremony, Sambutan Rektor, Pengenalan Universitas, Pengenalan Fakultas, Seminar Inspiratif.',
      lokasi: 'Telkom University Purwokerto',
      startAt: new Date('2026-09-09T08:00:00+07:00'),
      endAt: new Date('2026-09-09T16:00:00+07:00'),
      urutan: 4,
    },
    {
      judul: 'PKKMB — Day 2',
      deskripsi: 'Character Building, Campus Life, Pengenalan Organisasi Mahasiswa, Penutupan PKKMB.',
      lokasi: 'Telkom University Purwokerto',
      startAt: new Date('2026-09-10T08:00:00+07:00'),
      endAt: new Date('2026-09-10T16:00:00+07:00'),
      urutan: 5,
    },
  ];

  const bumperTalentPath = path.join(__dirname, '..', 'extracted-json', 'aset-bumper', 'bumper-talent.json');
  const bumperTalent = JSON.parse(fs.readFileSync(bumperTalentPath, 'utf8')) as {
    sessions: Array<{
      sesi: string;
      materi: Array<{
        no: number | null;
        pematerian: string | null;
        nama_pemateri: string | null;
        foto: string | null;
        ppt: string | null;
        catatan_media: string | null;
      }>;
    }>;
  };

  const monthMap: Record<string, string> = {
    JANUARI: '01',
    FEBRUARI: '02',
    MARET: '03',
    APRIL: '04',
    MEI: '05',
    JUNI: '06',
    JULI: '07',
    AGUSTUS: '08',
    SEPTEMBER: '09',
    OKTOBER: '10',
    NOVEMBER: '11',
    DESEMBER: '12',
  };

  const parseBumperDate = (sesi: string) => {
    const match = sesi.toUpperCase().match(/(\d{1,2})\s+([A-Z]+)\s+(\d{4})/);
    if (!match) throw new Error(`Tanggal sesi BUMPER TALENT tidak valid: ${sesi}`);
    const month = monthMap[match[2]];
    if (!month) throw new Error(`Bulan sesi BUMPER TALENT tidak dikenal: ${sesi}`);
    return new Date(`${match[3]}-${month}-${match[1].padStart(2, '0')}T08:00:00+07:00`);
  };

  const bumperTimeline = bumperTalent.sessions.flatMap((session, sessionIndex) => {
    const startAt = parseBumperDate(session.sesi);
    return session.materi.map((item, itemIndex) => ({
      judul: item.pematerian || 'Materi BUMPER TALENT',
      deskripsi: item.catatan_media,
      lokasi: 'Telkom University Purwokerto',
      day: sessionIndex + 1,
      sesi: session.sesi,
      pematerian: item.pematerian,
      namaPemateri: item.nama_pemateri,
      fotoUrl: item.foto,
      pptUrl: item.ppt,
      startAt,
      endAt: null,
      checklistItems: item.no !== null ? [`Urutan materi: ${item.no}`] : undefined,
      attachmentUrl: item.ppt || item.foto || null,
      urutan: 100 + sessionIndex * 100 + itemIndex,
    }));
  });

  await prisma.timelineEvent.deleteMany();
  await prisma.timelineEvent.createMany({ data: [...timeline, ...bumperTimeline] });
  console.log(`✅ Timeline BUMPER TALENT terimport: ${bumperTimeline.length} materi`);

  // =========================================================================
  // 2. FAQ KATEGORI & FAQ ITEMS
  // =========================================================================
  console.log('❓ Seeding FAQ & Kategori...');
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

  // =========================================================================
  // 3. SETTINGS
  // =========================================================================
  console.log('⚙️  Seeding Settings...');
  const settings: { key: string; value: any }[] = [
    { key: 'about.filosofi', value: 'BHUMARA berangkat dari kata "bhumi" (bumi) — tempat tumbuh, berakar, dan berkembang.' },
    { key: 'about.tema', value: 'Growing Today, Thriving Tomorrow' },
    { key: 'about.tema_judul', value: 'Tema PKKMB 2026' },
    { key: 'about.makna_logo', value: 'Api semangat dan sosok yang meraih tumbuh melambangkan pergerakan mahasiswa baru.' },
    { key: 'about.makna_maskot', value: 'Maskot merepresentasikan petualang muda yang menjelajah dunia kampus.' },
    { key: 'contact.instagram', value: 'https://instagram.com/pkkmb.telkompwt' },
    { key: 'contact.email', value: 'pkkmb@telkomuniversity.ac.id' },
    { key: 'contact.whatsapp', value: 'https://wa.me/6280000000000' },
    { key: 'pkkmb.whatsapp_grup', value: 'https://chat.whatsapp.com/Btj7ikWTAsIEVwJ6ghEEck?s=cl&p=a&mlu=0&ilr=4' },
    { key: 'pkkmb.whatsapp_grup_qr', value: '/images/whatsapp-group-pkkmb/wa_group-utama_pkkmb2026.png' },
    { key: 'contact.alamat', value: 'Jl. DI Panjaitan No.128, Purwokerto, Jawa Tengah' },
    { key: 'footer.copyright', value: `© ${new Date().getFullYear()} BHUMARA — PKKMB Telkom University Purwokerto` },
  ];
  for (const s of settings) {
    await prisma.settings.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }

  const galleryCampusPath = path.join(__dirname, '..', 'extracted-json', 'gallery-campus.json');
  const galleryCampus = JSON.parse(fs.readFileSync(galleryCampusPath, 'utf8')) as {
    gallery: string;
    note: string;
    images: Array<{ fileName: string; file: string; title: string; desc: string }>;
  };
  await prisma.settings.upsert({
    where: { key: 'gallery.campus' },
    update: { value: galleryCampus },
    create: { key: 'gallery.campus', value: galleryCampus },
  });
  console.log(`✅ Metadata gallery kampus tersimpan: ${galleryCampus.images.length} gambar`);

  // =========================================================================
  // 4. FAKULTAS & PROGRAM STUDI (Telkom University Purwokerto)
  // =========================================================================
  console.log('🏛️  Seeding Fakultas & Program Studi...');
  const fakultasData = [
    {
      nama: 'Fakultas Informatika',
      kode: 'FIF',
      prodis: ['S1 Informatika', 'S1 Rekayasa Perangkat Lunak', 'S1 Sistem Informasi', 'S1 Sains Data'],
    },
    {
      nama: 'Fakultas Teknik Telekomunikasi dan Elektro',
      kode: 'FTTE',
      prodis: ['S1 Teknik Telekomunikasi', 'S1 Teknik Elektro', 'S1 Teknik Biomedis'],
    },
    {
      nama: 'Fakultas Rekayasa Industri dan Desain',
      kode: 'FRID',
      prodis: ['S1 Teknik Industri', 'S1 Desain Komunikasi Visual', 'S1 Bisnis Digital'],
    },
  ];

  const fakultasMap = new Map<string, string>();
  const prodiMap = new Map<string, string>();

  for (const f of fakultasData) {
    const fakultasRecord = await prisma.fakultas.upsert({
      where: { nama: f.nama },
      update: { kode: f.kode },
      create: { nama: f.nama, kode: f.kode },
    });
    fakultasMap.set(f.nama, fakultasRecord.id);

    for (const prodiNama of f.prodis) {
      const prodiRecord = await prisma.programStudi.upsert({
        where: { nama_fakultasId: { nama: prodiNama, fakultasId: fakultasRecord.id } },
        update: {},
        create: { nama: prodiNama, fakultasId: fakultasRecord.id },
      });
      prodiMap.set(prodiNama, prodiRecord.id);
    }
  }

  // =========================================================================
  // 5. PENDAMPING & KELOMPOK
  // =========================================================================
  console.log('👥 Seeding Pendamping & Kelompok...');
  const defaultPasswordHash = await argon2.hash('Bhumara2026!');
  const adminPasswordHash = await argon2.hash('AdminBhumara2026!');
  const superAdminPasswordHash = await argon2.hash('SuperAdminBhumara2026!');

  // User Pendamping
  const pendampingUser = await prisma.user.upsert({
    where: { email: 'pendamping01@bhumara.telkomuniversity.ac.id' },
    update: {
      role: Role.panitia,
      phone: '081100000004',
      passwordHash: defaultPasswordHash,
      isActive: true,
    },
    create: {
      email: 'pendamping01@bhumara.telkomuniversity.ac.id',
      phone: '081100000004',
      role: Role.panitia,
      passwordHash: defaultPasswordHash,
      isActive: true,
    },
  });

  const pendampingProfile = await prisma.pendamping.upsert({
    where: { userId: pendampingUser.id },
    update: {
      nama: 'Kak Bima Sakti',
      kontak: '081100000004',
    },
    create: {
      userId: pendampingUser.id,
      nama: 'Kak Bima Sakti',
      kontak: '081100000004',
    },
  });

  const kelompokData = [
    { nama: 'Kelompok 01 - Bhumi Abyakta', pendampingId: pendampingProfile.id, whatsappChannelUrl: 'https://chat.whatsapp.com/sample-kelompok-01' },
    { nama: 'Kelompok 02 - Bhumi Nawasena', pendampingId: null, whatsappChannelUrl: 'https://chat.whatsapp.com/sample-kelompok-02' },
    { nama: 'Kelompok 03 - Bhumi Danadyaksa', pendampingId: null, whatsappChannelUrl: 'https://chat.whatsapp.com/sample-kelompok-03' },
    { nama: 'Kelompok 04 - Bhumi Mahawira', pendampingId: null, whatsappChannelUrl: 'https://chat.whatsapp.com/sample-kelompok-04' },
    { nama: 'Kelompok 05 - Bhumi Pradipta', pendampingId: null, whatsappChannelUrl: 'https://chat.whatsapp.com/sample-kelompok-05' },
  ];

  const kelompokMap = new Map<string, string>();
  for (const k of kelompokData) {
    const kel = await prisma.kelompok.upsert({
      where: { nama: k.nama },
      update: { pendampingId: k.pendampingId, whatsappChannelUrl: k.whatsappChannelUrl },
      create: k,
    });
    kelompokMap.set(k.nama, kel.id);
  }

  // =========================================================================
  // 6. ADMIN & SUPER ADMIN & PANITIA
  // =========================================================================
  console.log('🛡️  Seeding User Admin, Super Admin, dan Panitia...');
  const adminUsers = [
    {
      email: 'superadmin@bhumara.telkomuniversity.ac.id',
      phone: '081100000001',
      role: Role.admin,
      passwordHash: superAdminPasswordHash,
    },
    {
      email: 'admin@bhumara.telkomuniversity.ac.id',
      phone: '081100000002',
      role: Role.admin,
      passwordHash: adminPasswordHash,
    },
    {
      email: 'panitia@bhumara.telkomuniversity.ac.id',
      phone: '081100000003',
      role: Role.panitia,
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const a of adminUsers) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {
        role: a.role,
        phone: a.phone,
        passwordHash: a.passwordHash,
        isActive: true,
      },
      create: {
        email: a.email,
        phone: a.phone,
        role: a.role,
        passwordHash: a.passwordHash,
        isActive: true,
      },
    });
  }

  // HANYA AKUN ADMIN yang boleh login. Hapus semua akun login ber-role panitia
  // (panitia & pendamping). Data Mahasiswa (role mahasiswa) & profil Pendamping
  // TIDAK dihapus — profil pendamping hanya di-set userId=null (relasi SetNull).
  const removedPanitia = await prisma.user.deleteMany({ where: { role: Role.panitia } });
  console.log(`🧹 Menghapus ${removedPanitia.count} akun login panitia/pendamping (hanya admin yang bisa login).`);

  // =========================================================================
  // 7. USER MAHASISWA BARU (MABA) & PMB RECORD
  // =========================================================================
  console.log('🎓 Seeding User Mahasiswa Baru (Maba)...');
  const mabaPasswordHash = await argon2.hash('MabaBhumara2026!');

  const mabaList = [
    {
      nomorPendaftaran: '2026100001',
      nim: '1301260001',
      nama: 'Ahmad Fauzi',
      tanggalLahir: '2006-05-15',
      email: 'ahmad.fauzi@student.telkomuniversity.ac.id',
      noHp: '081234567801',
      fakultas: 'Fakultas Informatika',
      prodi: 'S1 Informatika',
      kelompok: 'Kelompok 01 - Bhumi Abyakta',
      robloxUserId: '71000001',
      kontakDarurat: '081299112201 (Ayah)',
    },
    {
      nomorPendaftaran: '2026100002',
      nim: '1301260002',
      nama: 'Siti Nurhaliza',
      tanggalLahir: '2006-08-20',
      email: 'siti.nurhaliza@student.telkomuniversity.ac.id',
      noHp: '081234567802',
      fakultas: 'Fakultas Informatika',
      prodi: 'S1 Rekayasa Perangkat Lunak',
      kelompok: 'Kelompok 01 - Bhumi Abyakta',
      robloxUserId: '71000002',
      kontakDarurat: '081299112202 (Ibu)',
    },
    {
      nomorPendaftaran: '2026100003',
      nim: '1301260003',
      nama: 'Muhammad Rizky Pratama',
      tanggalLahir: '2006-01-10',
      email: 'rizky.pratama@student.telkomuniversity.ac.id',
      noHp: '081234567803',
      fakultas: 'Fakultas Informatika',
      prodi: 'S1 Sistem Informasi',
      kelompok: 'Kelompok 02 - Bhumi Nawasena',
      robloxUserId: '71000003',
      kontakDarurat: '081299112203 (Wali)',
    },
    {
      nomorPendaftaran: '2026100004',
      nim: '1301260004',
      nama: 'Putri Ayu Maharani',
      tanggalLahir: '2006-11-25',
      email: 'putri.maharani@student.telkomuniversity.ac.id',
      noHp: '081234567804',
      fakultas: 'Fakultas Informatika',
      prodi: 'S1 Sains Data',
      kelompok: 'Kelompok 02 - Bhumi Nawasena',
      robloxUserId: '71000004',
      kontakDarurat: '081299112204 (Ibu)',
    },
    {
      nomorPendaftaran: '2026100005',
      nim: '1301260005',
      nama: 'Dimas Bagus Saputra',
      tanggalLahir: '2006-03-14',
      email: 'dimas.saputra@student.telkomuniversity.ac.id',
      noHp: '081234567805',
      fakultas: 'Fakultas Teknik Telekomunikasi dan Elektro',
      prodi: 'S1 Teknik Telekomunikasi',
      kelompok: 'Kelompok 03 - Bhumi Danadyaksa',
      robloxUserId: '71000005',
      kontakDarurat: '081299112205 (Ayah)',
    },
    {
      nomorPendaftaran: '2026100006',
      nim: '1301260006',
      nama: 'Anisa Rahmawati',
      tanggalLahir: '2006-07-07',
      email: 'anisa.rahmawati@student.telkomuniversity.ac.id',
      noHp: '081234567806',
      fakultas: 'Fakultas Rekayasa Industri dan Desain',
      prodi: 'S1 Desain Komunikasi Visual',
      kelompok: 'Kelompok 04 - Bhumi Mahawira',
      robloxUserId: '71000006',
      kontakDarurat: '081299112206 (Kakak)',
    },
    {
      nomorPendaftaran: '2026100007',
      nim: '1301260007',
      nama: 'Fajar Hidayat',
      tanggalLahir: '2006-09-18',
      email: 'fajar.hidayat@student.telkomuniversity.ac.id',
      noHp: '081234567807',
      fakultas: 'Fakultas Rekayasa Industri dan Desain',
      prodi: 'S1 Bisnis Digital',
      kelompok: 'Kelompok 05 - Bhumi Pradipta',
      robloxUserId: '71000007',
      kontakDarurat: '081299112207 (Ayah)',
    },
    {
      nomorPendaftaran: '2026100008',
      nim: '1301260008',
      nama: 'Dewi Lestari',
      tanggalLahir: '2006-12-01',
      email: 'dewi.lestari@student.telkomuniversity.ac.id',
      noHp: '081234567808',
      fakultas: 'Fakultas Teknik Telekomunikasi dan Elektro',
      prodi: 'S1 Teknik Elektro',
      kelompok: 'Kelompok 05 - Bhumi Pradipta',
      robloxUserId: '71000008',
      kontakDarurat: '081299112208 (Ibu)',
    },
  ];

  for (const maba of mabaList) {
    const fakultasId = fakultasMap.get(maba.fakultas)!;
    const prodiId = prodiMap.get(maba.prodi)!;
    const kelompokId = kelompokMap.get(maba.kelompok) ?? null;
    // Derivasi field kelompok yang dipakai fitur publik "Cari Kelompok" (via NIM).
    const noKelompok = maba.kelompok.match(/Kelompok\s+(\d+)/i)?.[1] ?? null;
    const namaKelompok = maba.kelompok.includes(' - ')
      ? maba.kelompok.split(' - ')[1]
      : maba.kelompok;
    const menfaByKelompok: Record<string, string> = {
      '01': 'Kak Rangga Aditya',
      '02': 'Kak Salsabila Putri',
      '03': 'Kak Bima Sakti',
      '04': 'Kak Nadia Zahra',
      '05': 'Kak Yoga Pratama',
    };
    const menfa = noKelompok ? menfaByKelompok[noKelompok] ?? null : null;

    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email: maba.email },
      update: {
        role: Role.mahasiswa,
        phone: maba.noHp,
        passwordHash: mabaPasswordHash,
        isActive: true,
      },
      create: {
        email: maba.email,
        phone: maba.noHp,
        role: Role.mahasiswa,
        passwordHash: mabaPasswordHash,
        isActive: true,
      },
    });

    // 2. Upsert Mahasiswa record
    await prisma.mahasiswa.upsert({
      where: { nomorPendaftaran: maba.nomorPendaftaran },
      update: {
        userId: user.id,
        nama: maba.nama,
        nim: maba.nim,
        noKelompok,
        namaKelompok,
        menfa,
        tanggalLahir: new Date(maba.tanggalLahir),
        fakultasId,
        prodiId,
        kelompokId,
        robloxUserId: maba.robloxUserId,
        kontakDarurat: maba.kontakDarurat,
      },
      create: {
        userId: user.id,
        nomorPendaftaran: maba.nomorPendaftaran,
        nama: maba.nama,
        nim: maba.nim,
        noKelompok,
        namaKelompok,
        menfa,
        tanggalLahir: new Date(maba.tanggalLahir),
        fakultasId,
        prodiId,
        kelompokId,
        robloxUserId: maba.robloxUserId,
        kontakDarurat: maba.kontakDarurat,
      },
    });
  }

  // =========================================================================
  // 8. ORMAWA & UKM DARI ASET BUMPER
  // =========================================================================
  console.log('🏫 Seeding Ormawa & UKM dari JSON aset bumper...');
  const asetDir = path.join(__dirname, '..', 'extracted-json', 'aset-bumper');
  const ormawaRows = JSON.parse(fs.readFileSync(path.join(asetDir, 'ormawa.json'), 'utf8')) as Array<Record<string, unknown>>;
  const bumperRows = JSON.parse(fs.readFileSync(path.join(asetDir, 'bumper-ormawa.json'), 'utf8')) as Array<Record<string, unknown>>;
  const logoSummary = JSON.parse(fs.readFileSync(path.join(asetDir, 'logo-download-summary.json'), 'utf8')) as Array<{
    name: string;
    status: string;
    file?: string;
  }>;

  const bumperByName = new Map(
    bumperRows
      .filter((row) => typeof row['NAMA ORMAWA'] === 'string')
      .map((row) => [String(row['NAMA ORMAWA']).trim().toUpperCase(), row]),
  );
  const ormawaByName = new Map(
    ormawaRows
      .filter((row) => typeof row.ORMAWA === 'string')
      .map((row) => [String(row.ORMAWA).trim().toUpperCase(), row]),
  );
  const logoByName = new Map(
    logoSummary
      .filter((item) => item.status === 'downloaded' && item.file)
      .map((item) => [item.name.trim().toUpperCase(), item.file as string]),
  );

  const extractUrl = (value: unknown) => {
    if (typeof value !== 'string') return null;
    return value.match(/https?:\/\/[^\s)]+/)?.[0] ?? null;
  };
  const makeSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const inferCategory = (name: string) => {
    if (name === 'BEM') return 'BEM';
    if (/^HM[A-Z]/.test(name)) return 'HIMA';
    if (/^SATRIA MUDA$/.test(name)) return 'Komunitas';
    return 'UKM';
  };

  const allOrmawaNames = new Set([...ormawaByName.keys(), ...bumperByName.keys()]);
  await prisma.ormawa.deleteMany();

  for (const key of allOrmawaNames) {
    const source = ormawaByName.get(key) ?? {};
    const bumper = bumperByName.get(key) ?? {};
    const nama = key;
    const logoFile = logoByName.get(key);
    const narasi = typeof source['NARASI PARADE'] === 'string' ? source['NARASI PARADE'].trim() : null;
    const deskripsiWebsite = typeof source['DESKRIPSI WEBSITE'] === 'string' ? source['DESKRIPSI WEBSITE'].trim() : null;
    const bumperText = typeof bumper.TEXT === 'string' ? bumper.TEXT.trim() : null;

    await prisma.ormawa.create({
      data: {
        slug: makeSlug(nama),
        nama,
        kategori: inferCategory(nama),
        logoUrl: logoFile ? `/assets/ormawa-logos/${encodeURIComponent(logoFile)}` : null,
        deskripsi: deskripsiWebsite || narasi || bumperText,
        visiMisi: deskripsiWebsite,
        programKerja: narasi,
        prestasi: bumperText,
        instagramUrl: extractUrl(source['LINK CP']),
      },
    });
  }

  console.log(`✅ Ormawa/UKM terimport: ${allOrmawaNames.size}`);

  // =========================================================================
  // PLATFORM AKADEMIK (iGracias, CeLOE, dll.) — reference untuk halaman Academic
  // =========================================================================
  console.log('🎓 Seeding Platform Akademik...');
  await prisma.academicPlatform.deleteMany();
  await prisma.academicPlatform.createMany({
    data: [
      { nama: 'iGracias Telkom University', singkatan: 'iGracias', kategori: 'Portal Utama Akademik', url: 'https://igracias.telkomuniversity.ac.id/', deskripsi: 'Portal layanan akademik terpadu untuk pengisian KRS, cek KHS, nilai, dan pembayaran.', iconName: 'LayoutDashboard', fiturUtama: ['Pengisian KRS', 'Cek KHS & Nilai', 'Pembayaran', 'Jadwal Kuliah'], urutan: 1 },
      { nama: 'CeLOE LMS (EduRoom)', singkatan: 'LMS CeLOE', kategori: 'E-Learning & Tugas', url: 'https://lms.telkomuniversity.ac.id/', deskripsi: 'Platform pembelajaran digital untuk materi kuliah, tugas, kuis, dan forum diskusi.', iconName: 'BookOpenCheck', fiturUtama: ['Materi Kuliah', 'Pengumpulan Tugas', 'Kuis Online', 'Forum Diskusi'], urutan: 2 },
      { nama: 'TelU Open Library', singkatan: 'OpenLib', kategori: 'Perpustakaan & Riset', url: 'https://openlibrary.telkomuniversity.ac.id/', deskripsi: 'Perpustakaan digital resmi: ribuan e-book, jurnal internasional, dan repositori tugas akhir.', iconName: 'Library', fiturUtama: ['E-Book', 'Jurnal Internasional', 'Repositori TA', 'Peminjaman'], urutan: 3 },
      { nama: 'MyTelU Mobile App', singkatan: 'MyTelU', kategori: 'Aplikasi Mobile & KTM Digital', url: 'https://play.google.com/store/apps/details?id=ac.id.telkomuniversity.mytelu', deskripsi: 'Aplikasi mobile untuk KTM digital, presensi QR, jadwal, dan notifikasi kampus.', iconName: 'Smartphone', fiturUtama: ['KTM Digital', 'Presensi QR', 'Jadwal', 'Notifikasi'], urutan: 4 },
      { nama: 'Office 365 & Email Student', singkatan: 'M365 Student', kategori: 'Layanan Akun & Lisensi', url: 'https://outlook.office.com/', deskripsi: 'Lisensi resmi gratis Microsoft Office 365, Email Student, Teams, dan OneDrive 1TB.', iconName: 'Mail', fiturUtama: ['Email Student', 'Word/Excel/PPT', 'MS Teams', 'OneDrive 1TB'], urutan: 5 },
      { nama: 'Portal TAK & Kemahasiswaan', singkatan: 'TAK TelU', kategori: 'Kemahasiswaan & Sertifikat', url: 'https://igracias.telkomuniversity.ac.id/', deskripsi: 'Rekapitulasi Transkrip Aktivitas Kemahasiswaan (TAK) & pengajuan poin kegiatan.', iconName: 'Award', fiturUtama: ['Poin TAK', 'Sertifikat', 'Pengajuan Kegiatan'], urutan: 6 },
    ],
  });
  console.log('✅ Platform Akademik: 6');

  // =========================================================================
  // GEDUNG / CAMPUS SPOTS — reference untuk halaman Campus Tour
  // =========================================================================
  console.log('🏛️  Seeding Gedung / Campus Spots...');
  await prisma.gedung.deleteMany();
  await prisma.gedung.createMany({
    data: [
      { nama: 'Auditorium Telkom University Purwokerto', kategori: 'Gedung Utama', lokasi: 'Gedung Rektorat Utama Lt. 3', deskripsi: 'Aula utama untuk upacara, seminar besar, dan puncak acara PKKMB.', fasilitas: ['Kapasitas 1000+', 'Panggung & Sound System', 'AC & Proyektor'], jamOperasional: '07.00 – 21.00 WIB', googleMapsUrl: 'https://maps.app.goo.gl/8NskKq6Xjpg4Pf6s8', urutan: 1 },
      { nama: 'Perpustakaan & TelU Open Library', kategori: 'Fasilitas Publik', lokasi: 'Gedung Akademik Lt. 2', deskripsi: 'Perpustakaan modern dengan koleksi cetak & digital serta ruang baca nyaman.', fasilitas: ['Ruang Baca', 'Koleksi Digital', 'Diskusi Room'], jamOperasional: '08.00 – 16.00 WIB', urutan: 2 },
      { nama: 'Laboratorium Rekayasa Perangkat Lunak & AI', kategori: 'Lab & Riset', lokasi: 'Gedung Laboratorium Terpadu Lt. 3', deskripsi: 'Lab komputer untuk praktikum pemrograman, AI, dan riset mahasiswa.', fasilitas: ['PC Spek Tinggi', 'Jaringan Cepat', 'Software Berlisensi'], jamOperasional: '08.00 – 17.00 WIB', urutan: 3 },
      { nama: 'Student Center & Area Ormawa', kategori: 'Area Terbuka', lokasi: 'Kawasan Tengah Kampus', deskripsi: 'Pusat kegiatan mahasiswa & sekretariat organisasi kemahasiswaan.', fasilitas: ['Sekretariat Ormawa', 'Ruang Rapat', 'Area Kolaborasi'], jamOperasional: '24 Jam (Kegiatan)', urutan: 4 },
      { nama: 'Lapangan Olahraga Terpadu', kategori: 'Area Terbuka', lokasi: 'Kawasan Barat Kampus', deskripsi: 'Lapangan multifungsi untuk olahraga dan kegiatan outdoor PKKMB.', fasilitas: ['Lapangan Basket', 'Futsal', 'Area Upacara'], jamOperasional: '06.00 – 18.00 WIB', urutan: 5 },
      { nama: 'Kantin & Foodcourt Kampus', kategori: 'Fasilitas Publik', lokasi: 'Area Timur Kampus', deskripsi: 'Pusat kuliner kampus dengan beragam pilihan makanan sehat & terjangkau.', fasilitas: ['Aneka Tenant', 'Area Makan Luas', 'Pembayaran Digital'], jamOperasional: '07.00 – 19.00 WIB', urutan: 6 },
    ],
  });
  console.log('✅ Gedung / Campus Spots: 6');

  console.log('\n=============================================================');
  console.log('✅ SEEDING BERHASIL SELESAI!');
  console.log('=============================================================');
  console.log('Akun Admin yang bisa login (HANYA admin):');
  console.log('1. Admin       : admin@bhumara.telkomuniversity.ac.id      | Pass: AdminBhumara2026!');
  console.log('2. Super Admin : superadmin@bhumara.telkomuniversity.ac.id | Pass: SuperAdminBhumara2026!');
  console.log('   (Akun panitia & pendamping sudah dihapus — tidak bisa login.)');
  console.log('-------------------------------------------------------------');
  console.log('Data Mahasiswa tetap tersimpan untuk fitur publik "Kelompok" (via NIM).');
  console.log('Contoh NIM:');
  console.log('   1301260001 (Ahmad Fauzi) & 1301260002 (Siti) → Kelompok 01');
  console.log('   1301260005 (Dimas) → Kelompok 03 · 1301260007/1301260008 → Kelompok 05');
  console.log('=============================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi error saat seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
