-- AlterTable
ALTER TABLE "academic_platform" ALTER COLUMN "fitur_utama" DROP DEFAULT;

-- AlterTable
ALTER TABLE "gedung" ALTER COLUMN "fasilitas" DROP DEFAULT;

-- AlterTable
ALTER TABLE "timeline_events" ADD COLUMN     "day" INTEGER,
ADD COLUMN     "foto_url" TEXT,
ADD COLUMN     "nama_pemateri" TEXT,
ADD COLUMN     "pematerian" TEXT,
ADD COLUMN     "ppt_url" TEXT,
ADD COLUMN     "sesi" TEXT;

-- CreateIndex
CREATE INDEX "timeline_events_day_idx" ON "timeline_events"("day");
