-- CreateEnum
CREATE TYPE "Role" AS ENUM ('mahasiswa', 'pendamping', 'panitia', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "TimelineStatus" AS ENUM ('upcoming', 'ongoing', 'completed');

-- CreateEnum
CREATE TYPE "TargetScope" AS ENUM ('ALL', 'FAKULTAS', 'KELOMPOK');

-- CreateEnum
CREATE TYPE "TugasStatus" AS ENUM ('draft', 'published', 'closed');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('submitted', 'late', 'reviewed');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('MC', 'TF', 'SHORT');

-- CreateEnum
CREATE TYPE "QuizSessionStatus" AS ENUM ('ongoing', 'finished', 'abandoned');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('OPENING', 'TEMA', 'JINGGLE', 'SAMBUTAN', 'TREASURE');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'mahasiswa',
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nomor_pendaftaran" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nim" TEXT,
    "no_kelompok" TEXT,
    "nama_kelompok" TEXT,
    "menfa" TEXT,
    "tanggal_lahir" TIMESTAMP(3) NOT NULL,
    "fakultas_id" TEXT NOT NULL,
    "prodi_id" TEXT NOT NULL,
    "kelompok_id" TEXT,
    "roblox_user_id" TEXT,
    "avatar_url" TEXT,
    "kontak_darurat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fakultas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,

    CONSTRAINT "fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_studi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "fakultas_id" TEXT NOT NULL,

    CONSTRAINT "program_studi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelompok" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "pendamping_id" TEXT,
    "whatsapp_channel_url" TEXT,

    CONSTRAINT "kelompok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendamping" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "nama" TEXT NOT NULL,
    "kontak" TEXT,

    CONSTRAINT "pendamping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "lokasi" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "checklist_items" JSONB,
    "attachment_url" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kategori" TEXT,
    "deadline_at" TIMESTAMP(3) NOT NULL,
    "target_scope" "TargetScope" NOT NULL DEFAULT 'ALL',
    "target_ref_id" TEXT,
    "attachment_url" TEXT,
    "status" "TugasStatus" NOT NULL DEFAULT 'draft',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas_submissions" (
    "id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "tugas_id" TEXT NOT NULL,
    "file_url" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'submitted',

    CONSTRAINT "tugas_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ormawa" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "logo_url" TEXT,
    "thumbnail_video_url" TEXT,
    "video_profil_url" TEXT,
    "deskripsi" TEXT,
    "visi_misi" TEXT,
    "program_kerja" TEXT,
    "prestasi" TEXT,
    "instagram_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ormawa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ormawa_galeri" (
    "id" TEXT NOT NULL,
    "ormawa_id" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',

    CONSTRAINT "ormawa_galeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gedung" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "fungsi" TEXT,
    "jumlah_lantai" INTEGER,
    "daftar_ruangan" JSONB,
    "jam_operasional" TEXT,
    "foto_url" TEXT,
    "video_url" TEXT,
    "google_maps_url" TEXT,
    "koordinat_x" DOUBLE PRECISION,
    "koordinat_y" DOUBLE PRECISION,

    CONSTRAINT "gedung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "faq_kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq" (
    "id" TEXT NOT NULL,
    "kategori_id" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_pkkmb" (
    "id" TEXT NOT NULL,
    "tipe" "VideoType" NOT NULL,
    "judul" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "video_pkkmb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "tipe" "QuizType" NOT NULL DEFAULT 'MC',
    "pertanyaan" TEXT NOT NULL,
    "opsi" JSONB,
    "jawaban_benar" TEXT NOT NULL,
    "poin" INTEGER NOT NULL DEFAULT 10,
    "durasi_detik" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_sessions" (
    "id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "skor" INTEGER NOT NULL DEFAULT 0,
    "status" "QuizSessionStatus" NOT NULL DEFAULT 'ongoing',

    CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "jawaban_dipilih" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "waktu_jawab" INTEGER,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "icon_url" TEXT,
    "kriteria" TEXT,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa_badges" (
    "id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mahasiswa_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_sources" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "account_ref" TEXT NOT NULL,
    "access_token" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "social_media_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_posts" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "title" TEXT,
    "media_url" TEXT,
    "permalink" TEXT,
    "posted_at" TIMESTAMP(3),
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "social_media_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guidebook" (
    "id" TEXT NOT NULL,
    "fakultas_id" TEXT,
    "prodi_id" TEXT,
    "file_url" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guidebook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "diff" JSONB,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "target_scope" "TargetScope" NOT NULL DEFAULT 'ALL',
    "target_ref_id" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'push',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_user_id_key" ON "mahasiswa"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nomor_pendaftaran_key" ON "mahasiswa"("nomor_pendaftaran");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE INDEX "mahasiswa_fakultas_id_idx" ON "mahasiswa"("fakultas_id");

-- CreateIndex
CREATE INDEX "mahasiswa_kelompok_id_idx" ON "mahasiswa"("kelompok_id");

-- CreateIndex
CREATE UNIQUE INDEX "fakultas_nama_key" ON "fakultas"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "fakultas_kode_key" ON "fakultas"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "program_studi_nama_fakultas_id_key" ON "program_studi"("nama", "fakultas_id");

-- CreateIndex
CREATE UNIQUE INDEX "kelompok_nama_key" ON "kelompok"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "pendamping_user_id_key" ON "pendamping"("user_id");

-- CreateIndex
CREATE INDEX "timeline_events_start_at_idx" ON "timeline_events"("start_at");

-- CreateIndex
CREATE INDEX "tugas_status_idx" ON "tugas"("status");

-- CreateIndex
CREATE INDEX "tugas_deadline_at_idx" ON "tugas"("deadline_at");

-- CreateIndex
CREATE UNIQUE INDEX "tugas_submissions_mahasiswa_id_tugas_id_key" ON "tugas_submissions"("mahasiswa_id", "tugas_id");

-- CreateIndex
CREATE UNIQUE INDEX "ormawa_slug_key" ON "ormawa"("slug");

-- CreateIndex
CREATE INDEX "ormawa_kategori_idx" ON "ormawa"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "faq_kategori_nama_key" ON "faq_kategori"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "faq_kategori_slug_key" ON "faq_kategori"("slug");

-- CreateIndex
CREATE INDEX "faq_kategori_id_idx" ON "faq"("kategori_id");

-- CreateIndex
CREATE INDEX "faq_is_featured_idx" ON "faq"("is_featured");

-- CreateIndex
CREATE INDEX "quiz_questions_kategori_idx" ON "quiz_questions"("kategori");

-- CreateIndex
CREATE INDEX "quiz_questions_is_active_idx" ON "quiz_questions"("is_active");

-- CreateIndex
CREATE INDEX "quiz_sessions_mahasiswa_id_idx" ON "quiz_sessions"("mahasiswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_session_id_question_id_key" ON "quiz_answers"("session_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_kode_key" ON "badges"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_badges_mahasiswa_id_badge_id_key" ON "mahasiswa_badges"("mahasiswa_id", "badge_id");

-- CreateIndex
CREATE INDEX "social_media_posts_posted_at_idx" ON "social_media_posts"("posted_at");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_posts_source_id_external_id_key" ON "social_media_posts"("source_id", "external_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_idx" ON "audit_log"("entity");

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_fakultas_id_fkey" FOREIGN KEY ("fakultas_id") REFERENCES "fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_kelompok_id_fkey" FOREIGN KEY ("kelompok_id") REFERENCES "kelompok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_studi" ADD CONSTRAINT "program_studi_fakultas_id_fkey" FOREIGN KEY ("fakultas_id") REFERENCES "fakultas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelompok" ADD CONSTRAINT "kelompok_pendamping_id_fkey" FOREIGN KEY ("pendamping_id") REFERENCES "pendamping"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendamping" ADD CONSTRAINT "pendamping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_submissions" ADD CONSTRAINT "tugas_submissions_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_submissions" ADD CONSTRAINT "tugas_submissions_tugas_id_fkey" FOREIGN KEY ("tugas_id") REFERENCES "tugas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ormawa_galeri" ADD CONSTRAINT "ormawa_galeri_ormawa_id_fkey" FOREIGN KEY ("ormawa_id") REFERENCES "ormawa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq" ADD CONSTRAINT "faq_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "faq_kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_badges" ADD CONSTRAINT "mahasiswa_badges_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_badges" ADD CONSTRAINT "mahasiswa_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "social_media_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
