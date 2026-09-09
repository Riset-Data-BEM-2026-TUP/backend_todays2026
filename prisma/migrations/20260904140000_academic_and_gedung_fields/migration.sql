-- Extend gedung dengan kolom untuk campus-tour (aditif, aman)
ALTER TABLE "gedung" ADD COLUMN "kategori" TEXT;
ALTER TABLE "gedung" ADD COLUMN "lokasi" TEXT;
ALTER TABLE "gedung" ADD COLUMN "deskripsi" TEXT;
ALTER TABLE "gedung" ADD COLUMN "deskripsi_lengkap" TEXT;
ALTER TABLE "gedung" ADD COLUMN "fasilitas" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "gedung" ADD COLUMN "urutan" INTEGER NOT NULL DEFAULT 0;

-- Tabel baru academic_platform (data platform akademik iGracias/CeLOE/dll.)
CREATE TABLE "academic_platform" (
  "id" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
  "singkatan" TEXT,
  "kategori" TEXT NOT NULL,
  "url" TEXT,
  "deskripsi" TEXT,
  "deskripsi_lengkap" TEXT,
  "icon_name" TEXT,
  "fitur_utama" TEXT[] NOT NULL DEFAULT '{}',
  "urutan" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "academic_platform_pkey" PRIMARY KEY ("id")
);
