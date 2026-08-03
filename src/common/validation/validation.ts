import { z } from "zod";

/**
 * Skema validasi bersama untuk Backend API.
 */

// Format nomor HP Indonesia: 08xx atau +62xx
export const phoneID = z
  .string()
  .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Nomor HP Indonesia tidak valid");

// ---- Auth: login dicocokkan ke data PMB (bukan registrasi bebas) ----
export const loginSchema = z.object({
  nomorPendaftaran: z.string().min(4, "Nomor pendaftaran wajib diisi"),
  tanggalLahir: z.coerce.date({ errorMap: () => ({ message: "Tanggal lahir tidak valid" }) }),
  email: z.string().email("Email tidak valid"),
  noHp: phoneID,
  fakultas: z.string().min(1, "Fakultas wajib diisi"),
  prodi: z.string().min(1, "Program studi wajib diisi"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---- Contact form (publik, rate-limited + honeypot) ----
export const contactSchema = z.object({
  nama: z.string().min(2).max(120),
  email: z.string().email(),
  pesan: z.string().min(5).max(2000),
  // honeypot: harus kosong; kalau terisi -> bot
  website: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ---- Query publik ----
export const ormawaQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export const faqQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});
