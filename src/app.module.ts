import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { FaqModule } from './modules/faq/faq.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { OrmawaModule } from './modules/ormawa/ormawa.module';
import { AcademicModule } from './modules/academic/academic.module';
import { GedungModule } from './modules/gedung/gedung.module';
import { KelompokModule } from './modules/kelompok/kelompok.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: { transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined },
    }),
    // Rate limit global default: 100 req / menit / IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    TimelineModule,
    FaqModule,
    SettingsModule,
    ReferenceModule,
    OrmawaModule,
    AcademicModule,
    GedungModule,
    KelompokModule,
    HealthModule,
    // TODO modul berikutnya (pola sama): mahasiswa, kelompok, pendamping, tugas,
    // ormawa, gedung, roblox, quiz, media-sosial, guidebook, upload, notifikasi, admin, audit-log
  ],
})
export class AppModule {}
