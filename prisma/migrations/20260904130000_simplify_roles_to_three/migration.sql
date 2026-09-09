-- Simplify Role enum from 5 -> 3 (mahasiswa, panitia, admin)
-- Remap removed roles ke role tersisa terlebih dahulu agar cast enum aman:
--   super_admin -> admin
--   pendamping  -> panitia
UPDATE "users" SET "role" = 'admin' WHERE "role" = 'super_admin';
UPDATE "users" SET "role" = 'panitia' WHERE "role" = 'pendamping';

-- Recreate enum Role tanpa nilai 'pendamping' & 'super_admin'
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('mahasiswa', 'panitia', 'admin');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'mahasiswa';
DROP TYPE "Role_old";
